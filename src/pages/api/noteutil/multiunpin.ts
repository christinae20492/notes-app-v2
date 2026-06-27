import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const supabase = createSupabaseServerClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: No active session." });
  }

  const { noteIds } = req.body;

  if (!Array.isArray(noteIds) || noteIds.length === 0) {
    return res.status(400).json({ message: "An array of note IDs is required in the request body." });
  }

  const { data, error } = await supabase
    .from("notes")
    .update({ tag: "none" })
    .in("id", noteIds)
    .eq("user_id", user.id)
    .eq("tag", "important")
    .select();

  if (error) {
    console.error("API: Error unpinning notes:", error);
    return res.status(500).json({ message: "Internal server error while unpinning notes." });
  }

  const count = data?.length ?? 0;
  return res.status(200).json({ message: `${count} notes unpinned successfully!`, count });
}
