import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient, mapFolder } from "@/lib/supabase-server";
import { EditFolder } from "@/app/utils/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const folderId = Array.isArray(id) ? id[0] : id;

  if (!folderId) {
    return res.status(400).json({ message: "Folder ID is required." });
  }

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
        .eq("id", folderId)
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        return res.status(404).json({ message: "Folder not found or you do not have access." });
      }
      return res.status(200).json(mapFolder(data));
    }

    case "PATCH": {
      const updateData: EditFolder = req.body;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No fields provided for update." });
      }

      const dbUpdate: Record<string, any> = {};
      if (updateData.title !== undefined) dbUpdate.title = updateData.title;

      const { data, error } = await supabase
        .from("folders")
        .update(dbUpdate)
        .eq("id", folderId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({ message: "Folder not found or you do not have access to update." });
      }
      return res.status(200).json({ message: "Folder updated successfully!", folder: mapFolder(data) });
    }

    case "DELETE": {
      const { data: folderToDelete } = await supabase
        .from("folders")
        .select("id")
        .eq("id", folderId)
        .eq("user_id", userId)
        .single();

      if (!folderToDelete) {
        return res.status(404).json({ message: "Folder not found or you do not have access to delete." });
      }

      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId)
        .eq("user_id", userId);

      if (error) {
        console.error(`API: Error deleting folder ${folderId}:`, error);
        return res.status(500).json({ message: "Internal server error while deleting folder." });
      }
      return res.status(200).json({ message: "Folder permanently deleted!" });
    }

    default:
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
