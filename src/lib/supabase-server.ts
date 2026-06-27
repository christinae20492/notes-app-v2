import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export function createSupabaseServerClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(req.headers.cookie ?? "");
      },
      setAll(cookiesToSet) {
        const existing = res.getHeader("Set-Cookie");
        const existingArr = Array.isArray(existing)
          ? existing
          : existing
          ? [String(existing)]
          : [];
        res.setHeader("Set-Cookie", [
          ...existingArr,
          ...cookiesToSet.map(({ name, value, options }) =>
            serializeCookieHeader(name, value, options)
          ),
        ]);
      },
    },
  });
}

// Admin client that bypasses RLS — requires SUPABASE_SERVICE_ROLE_KEY in env
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function mapNote(row: any) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    color: row.color,
    category: row.category,
    tag: row.tag,
    dateCreated: row.date_created,
    dateUpdated: row.date_updated,
    dateDeleted: row.date_deleted,
    isTrash: row.is_trash,
    userId: row.user_id,
    folderId: row.folder_id,
  };
}

export function mapFolder(row: any) {
  return {
    id: row.id,
    title: row.title,
    dateCreated: row.date_created,
    dateUpdated: row.date_updated,
    userId: row.user_id,
  };
}
