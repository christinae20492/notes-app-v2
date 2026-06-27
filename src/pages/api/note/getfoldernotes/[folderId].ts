import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient, mapNote } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { folderId: queryFolderId } = req.query;
  const folderId = Array.isArray(queryFolderId) ? queryFolderId[0] : queryFolderId;

  if (!folderId) {
    return res.status(400).json({ message: "Folder ID is required in the URL path." });
  }

  const supabase = createSupabaseServerClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: No active session." });
  }

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("folder_id", folderId)
    .eq("is_trash", false)
    .order("date_created", { ascending: false });

  if (error) {
    console.error(`API: Error fetching notes for folder ${folderId}:`, error);
    return res.status(500).json({ message: "Internal server error while fetching notes." });
  }

  return res.status(200).json(data.map(mapNote));
}
