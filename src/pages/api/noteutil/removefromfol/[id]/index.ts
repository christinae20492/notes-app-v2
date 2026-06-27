import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient, mapNote } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const noteId = Array.isArray(id) ? id[0] : id;

  if (!noteId) {
    return res.status(400).json({ message: "Note ID is required." });
  }
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const supabase = createSupabaseServerClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: No active session." });
  }

  const { folderId } = req.body;

  const { data, error } = await supabase
    .from("notes")
    .update({ folder_id: null })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .eq("folder_id", folderId)
    .select()
    .single();

  if (error || !data) {
    return res.status(404).json({ message: "Note not found or you do not have access to folder." });
  }

  return res.status(200).json({ message: "Note removed from folder successfully!", note: mapNote(data) });
}
