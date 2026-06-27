import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient, mapNote } from "@/lib/supabase-server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createSupabaseServerClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: No active session." });
  }

  const userId = user.id;

  switch (req.method) {
    case "GET": {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .eq("is_trash", false)
        .is("folder_id", null)
        .order("date_created", { ascending: false });

      if (error) {
        console.error("API: Error fetching notes:", error);
        return res.status(500).json({ message: "Internal server error while fetching notes." });
      }
      return res.status(200).json(data.map(mapNote));
    }

    case "POST": {
      const { title, body, color, category, tag, folderId } = req.body;
      if (!title || !body) {
        return res.status(400).json({ message: "Title and body are required." });
      }

      const { data, error } = await supabase
        .from("notes")
        .insert({
          title,
          body,
          color: color ?? "",
          category: category ?? "",
          tag: tag ?? "none",
          user_id: userId,
          folder_id: folderId ?? null,
          is_trash: false,
        })
        .select()
        .single();

      if (error) {
        console.error("API: Error creating note:", error);
        return res.status(500).json({ message: "Failed to create note." });
      }
      return res.status(201).json({ message: "Note created successfully!", note: mapNote(data) });
    }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
