import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
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
    .delete()
    .in("id", noteIds)
    .eq("user_id", user.id)
    .eq("is_trash", true)
    .select();

  if (error) {
    console.error("API: Error deleting multiple notes:", error);
    return res.status(500).json({ message: "Internal server error while deleting multiple notes." });
  }

  const count = data?.length ?? 0;
  if (count === 0) {
    return res.status(404).json({ message: "No trash notes found with the provided IDs." });
  }

  return res.status(200).json({ message: `${count} notes permanently deleted successfully!`, count });
}
