import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient, mapNote } from "@/lib/supabase-server";
import { EditNote } from "@/app/utils/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const noteId = Array.isArray(id) ? id[0] : id;

  if (!noteId) {
    return res.status(400).json({ message: "Note ID is required." });
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
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        return res.status(404).json({ message: "Note not found or you do not have access." });
      }
      return res.status(200).json(mapNote(data));
    }

    case "PATCH": {
      const updateData: EditNote = req.body;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No fields provided for update." });
      }

      // Map camelCase client fields to snake_case DB columns
      const dbUpdate: Record<string, any> = {};
      if (updateData.title !== undefined) dbUpdate.title = updateData.title;
      if (updateData.body !== undefined) dbUpdate.body = updateData.body;
      if (updateData.color !== undefined) dbUpdate.color = updateData.color;
      if (updateData.category !== undefined) dbUpdate.category = updateData.category;
      if (updateData.tag !== undefined) dbUpdate.tag = updateData.tag;
      if (updateData.dateDeleted !== undefined) dbUpdate.date_deleted = updateData.dateDeleted;

      const { data, error } = await supabase
        .from("notes")
        .update(dbUpdate)
        .eq("id", noteId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({ message: "Note not found or you do not have access to update." });
      }
      return res.status(200).json({ message: "Note updated successfully!", note: mapNote(data) });
    }

    case "DELETE": {
      // Only allow deleting notes that are in trash
      const { data: noteToDelete } = await supabase
        .from("notes")
        .select("id")
        .eq("id", noteId)
        .eq("user_id", userId)
        .eq("is_trash", true)
        .single();

      if (!noteToDelete) {
        return res.status(404).json({ message: "Note not found or you do not have access to delete." });
      }

      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", userId);

      if (error) {
        console.error(`API: Error deleting note ${noteId}:`, error);
        return res.status(500).json({ message: "Internal server error while deleting note." });
      }
      return res.status(200).json({ message: "Note permanently deleted successfully!" });
    }

    default:
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
