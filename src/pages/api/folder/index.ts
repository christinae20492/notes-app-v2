import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient, mapFolder } from "@/lib/supabase-server";

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
        .from("folders")
        .select("*")
        .eq("user_id", userId)
        .order("date_created", { ascending: false });

      if (error) {
        console.error("API: Error fetching folders:", error);
        return res.status(500).json({ message: "Internal server error while fetching folders." });
      }
      return res.status(200).json(data.map(mapFolder));
    }

    case "POST": {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required." });
      }

      const { data, error } = await supabase
        .from("folders")
        .insert({ title, user_id: userId })
        .select()
        .single();

      if (error) {
        console.error("API: Error creating folder:", error);
        if (error.code === "23505") {
          return res.status(409).json({ message: "A folder with that name already exists." });
        }
        return res.status(500).json({ message: "Failed to create folder." });
      }
      return res.status(201).json({ message: "Folder created successfully!", folder: mapFolder(data) });
    }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
