/**
 * Import data from prisma-export.json into Supabase.
 *
 * Prerequisites:
 *   1. Run the Supabase schema SQL first (supabase-schema.sql).
 *   2. Run the export script:  npx tsx scripts/export-prisma-data.ts
 *   3. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local
 *      (Project Settings → API → service_role key in the Supabase dashboard)
 *
 * Run with:
 *   npx tsx scripts/import-supabase-data.ts
 *
 * What this script does:
 *   - Creates a Supabase Auth user for every exported user (email_confirm: true).
 *   - Users are given a temporary random password — they MUST use "Forgot Password"
 *     to set a new one, OR you can enable password reset emails below.
 *   - Inserts profile, folder, and note rows preserving all original UUIDs.
 *
 * IMPORTANT: Run this script only ONCE against a fresh Supabase project.
 *            Re-running will cause duplicate key errors.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

// ── Load env vars ────────────────────────────────────────────────────────────
function loadEnv(file: string) {
  const p = path.join(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key?.trim() && rest.length) {
      process.env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
    }
  }
}
loadEnv(".env");
loadEnv(".env.local");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  console.error(
    "Add SUPABASE_SERVICE_ROLE_KEY to .env.local (find it in Supabase → Project Settings → API)"
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface ExportedUser {
  id: string;
  createdAt: string;
  email: string;
  username: string;
  sort: string;
  darkMode: boolean;
}

interface ExportedFolder {
  id: string;
  title: string;
  dateCreated: string;
  dateUpdated: string;
  userId: string;
}

interface ExportedNote {
  id: string;
  title: string;
  body: string;
  color: string;
  category: string;
  tag: string;
  dateCreated: string;
  dateUpdated: string;
  dateDeleted: string | null;
  isTrash: boolean;
  userId: string;
  folderId: string | null;
}

interface ExportFile {
  exportedAt: string;
  counts: { users: number; folders: number; notes: number };
  users: ExportedUser[];
  folders: ExportedFolder[];
  notes: ExportedNote[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const exportPath = path.join(process.cwd(), "scripts", "prisma-export.json");
  if (!fs.existsSync(exportPath)) {
    console.error(`Export file not found: ${exportPath}`);
    console.error("Run the export script first: npx tsx scripts/export-prisma-data.ts");
    process.exit(1);
  }

  const data: ExportFile = JSON.parse(fs.readFileSync(exportPath, "utf-8"));
  console.log(`\nImporting data exported at ${data.exportedAt}`);
  console.log(
    `  ${data.counts.users} users, ${data.counts.folders} folders, ${data.counts.notes} notes\n`
  );

  // ── Step 1: Create Supabase Auth users ──────────────────────────────────────
  console.log("Step 1/4: Creating Supabase Auth users...");
  const userResults: { id: string; email: string; tempPassword: string }[] = [];
  let userFailCount = 0;

  for (const user of data.users) {
    const tempPassword = randomUUID(); // Users must reset this via "Forgot Password"

    const { data: created, error } = await admin.auth.admin.createUser({
      email: user.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { username: user.username },
    });

    if (error) {
      console.warn(`  WARN: Could not create auth user for ${user.email}: ${error.message}`);
      userFailCount++;
      continue;
    }

    // The Supabase trigger will create the profile row, but we need the
    // auth user ID to match the original ID for foreign keys to work.
    // We'll manually upsert the profile with the ORIGINAL uuid below.
    userResults.push({ id: user.id, email: user.email, tempPassword });

    // Brief pause to stay under Supabase Auth rate limits
    await sleep(150);
  }

  console.log(
    `  Created ${userResults.length} auth users (${userFailCount} failed/skipped)\n`
  );

  // ── Step 2: Upsert profile rows with original UUIDs ─────────────────────────
  // The trigger inserts a profile using the NEW auth user ID, which differs
  // from the original Prisma UUID. We overwrite those rows here with the
  // correct data, keyed on email (which is unique).
  console.log("Step 2/4: Upserting profile rows...");

  // Build a map: email → original UUID
  const emailToOriginalId = Object.fromEntries(data.users.map((u) => [u.email, u]));

  // Delete trigger-created profiles and re-insert with original IDs
  // We do this by matching on email (since the auth user has a different ID)
  let profileOk = 0;
  let profileFail = 0;

  for (const user of data.users) {
    // First remove any trigger-created profile row for this email
    await admin.from("profiles").delete().eq("email", user.email);

    // Now insert the profile with the original UUID
    const { error } = await admin.from("profiles").insert({
      id: user.id,
      created_at: user.createdAt,
      email: user.email,
      username: user.username,
      sort: user.sort ?? "",
      dark_mode: user.darkMode ?? false,
    });

    if (error) {
      console.warn(`  WARN: Profile insert failed for ${user.email}: ${error.message}`);
      profileFail++;
    } else {
      profileOk++;
    }
  }

  console.log(`  Profiles upserted: ${profileOk} ok, ${profileFail} failed\n`);

  // ── Step 3: Insert folders ─────────────────────────────────────────────────
  console.log("Step 3/4: Inserting folders...");
  const BATCH = 100;
  let folderOk = 0;

  for (let i = 0; i < data.folders.length; i += BATCH) {
    const batch = data.folders.slice(i, i + BATCH).map((f) => ({
      id: f.id,
      title: f.title,
      date_created: f.dateCreated,
      date_updated: f.dateUpdated,
      user_id: f.userId,
    }));

    const { error } = await admin.from("folders").insert(batch);
    if (error) {
      console.warn(`  WARN: Folder batch ${i}–${i + BATCH} failed: ${error.message}`);
    } else {
      folderOk += batch.length;
    }
  }

  console.log(`  Folders inserted: ${folderOk} / ${data.folders.length}\n`);

  // ── Step 4: Insert notes ───────────────────────────────────────────────────
  console.log("Step 4/4: Inserting notes...");
  let noteOk = 0;

  for (let i = 0; i < data.notes.length; i += BATCH) {
    const batch = data.notes.slice(i, i + BATCH).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      color: n.color ?? "",
      category: n.category ?? "",
      tag: n.tag ?? "none",
      date_created: n.dateCreated,
      date_updated: n.dateUpdated,
      date_deleted: n.dateDeleted ?? null,
      is_trash: n.isTrash ?? false,
      user_id: n.userId,
      folder_id: n.folderId ?? null,
    }));

    const { error } = await admin.from("notes").insert(batch);
    if (error) {
      console.warn(`  WARN: Note batch ${i}–${i + BATCH} failed: ${error.message}`);
    } else {
      noteOk += batch.length;
    }
  }

  console.log(`  Notes inserted: ${noteOk} / ${data.notes.length}\n`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════");
  console.log("Import complete!");
  console.log(`  Auth users: ${userResults.length}`);
  console.log(`  Profiles:   ${profileOk}`);
  console.log(`  Folders:    ${folderOk}`);
  console.log(`  Notes:      ${noteOk}`);
  console.log("═══════════════════════════════════════════════");
  console.log(
    "\nIMPORTANT: All users have been given a temporary random password."
  );
  console.log(
    "Send password-reset emails via the Supabase dashboard, or enable"
  );
  console.log(
    "the Supabase email template to prompt users to set a new password.\n"
  );

  // Optional: send password reset emails to all imported users
  // Uncomment the block below to trigger reset emails automatically.
  /*
  console.log("Sending password reset emails...");
  for (const { email } of userResults) {
    await admin.auth.admin.generateLink({
      type: "recovery",
      email,
    });
    await sleep(100);
  }
  console.log("Password reset emails sent.");
  */
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
