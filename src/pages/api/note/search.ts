import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient, mapNote } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { q } = req.query;
  const query = Array.isArray(q) ? q[0] : q;

  if (!query || query.trim() === "") {
    return res.status(200).json({ notes: [], foundInFolders: false });
  }

  const supabase = createSupabaseServerClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: No active session." });
  }

  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_trash", false)
      .or(`title.ilike.%${query}%,body.ilike.%${query}%`)
      .order("date_updated", { ascending: false });

    if (error) {
      console.error("API: Error during note search:", error);
      return res.status(500).json({ message: "Internal server error during search." });
    }

    const notes = data.map(mapNote);
    const foundInFolders = notes.some((note) => note.folderId !== null);
    return res.status(200).json({ notes, foundInFolders });
  } catch (error) {
    console.error("API: Error during note search:", error);
    return res.status(500).json({ message: "Internal server error during search." });
  }
}
