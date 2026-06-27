/**
 * Export all data from the Prisma/PostgreSQL database to a JSON file.
 *
 * Run with:
 *   npx tsx scripts/export-prisma-data.ts
 *
 * Requires the DATABASE_URL env var pointing to the Prisma Accelerate endpoint.
 * Output: scripts/prisma-export.json
 */

import { PrismaClient } from "../src/generated/prisma";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Load .env manually since this runs outside Next.js
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) {
        process.env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
      }
    }
  }

  const prisma = new PrismaClient();

  console.log("Connecting to Prisma database...");

  try {
    const [users, folders, notes] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          createdAt: true,
          email: true,
          username: true,
          sort: true,
          darkMode: true,
        },
      }),
      prisma.folder.findMany({
        select: {
          id: true,
          title: true,
          dateCreated: true,
          dateUpdated: true,
          userId: true,
        },
      }),
      prisma.note.findMany({
        select: {
          id: true,
          title: true,
          body: true,
          color: true,
          category: true,
          tag: true,
          dateCreated: true,
          dateUpdated: true,
          dateDeleted: true,
          isTrash: true,
          userId: true,
          folderId: true,
        },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      counts: { users: users.length, folders: folders.length, notes: notes.length },
      users,
      folders,
      notes,
    };

    const outputPath = path.join(process.cwd(), "scripts", "prisma-export.json");
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), "utf-8");

    console.log(`\nExport complete!`);
    console.log(`  Users:   ${users.length}`);
    console.log(`  Folders: ${folders.length}`);
    console.log(`  Notes:   ${notes.length}`);
    console.log(`\nSaved to: ${outputPath}`);
    console.log("\nNOTE: Passwords are NOT exported — Supabase Auth manages credentials.");
    console.log("Users will need to reset their passwords after migration.\n");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
