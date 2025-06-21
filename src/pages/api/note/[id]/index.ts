import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '@/app/prisma';
import { Note, EditNote } from '@/app/utils/types'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const noteId = Array.isArray(id) ? id[0] : id;

  if (!noteId) {
    return res.status(400).json({ message: 'Note ID is required.' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.warn(`API: Unauthorized attempt to ${req.method} note (no session). Note ID: ${noteId}`);
    return res.status(401).json({ message: 'Unauthorized: No active session.' });
  }

  const userId = session.user.id;
  if (!userId) {
    console.error("API: User ID not found in session for authenticated user.");
    return res.status(400).json({ message: 'User ID missing from session.' });
  }

  switch (req.method) {
    case 'GET':
      console.log(`API: User ${userId} is requesting note with ID: ${noteId}`);
      try {
        const note = await prisma.note.findUnique({
          where: {
            id: noteId,
            userId: userId,
          },
        });

        if (!note) {
          return res.status(404).json({ message: 'Note not found or you do not have access.' });
        }

        return res.status(200).json(note);
      } catch (error) {
        console.error(`API: Error fetching note ${noteId}:`, error);
        return res.status(500).json({ message: 'Internal server error while fetching note.' });
      }

    case 'PATCH':
      console.log(`API: User ${userId} is attempting to update note with ID: ${noteId}`);
      const updateData: EditNote = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
      }

      try {
        const updatedNote = await prisma.note.update({
          where: {
            id: noteId,
            userId: userId,
          },
          data: {
            ...updateData,
            dateUpdated: new Date(),
          },
        });

        return res.status(200).json({ message: 'Note updated successfully!', note: updatedNote });
      } catch (error: any) {
        if (error.code === 'P2025') {
          return res.status(404).json({ message: 'Note not found or you do not have access to update.' });
        }
        console.error(`API: Error updating note ${noteId}:`, error);
        return res.status(500).json({ message: 'Internal server error while updating note.' });
      }

    case 'DELETE':
      console.log(`API: User ${userId} is attempting to PERMANENTLY DELETE note with ID: ${noteId}`);
      try {
        const noteToDelete = await prisma.note.findUnique({
            where: {
                id: noteId,
                userId: userId,
                isTrash: true,
            }
        });

        if (!noteToDelete) {
            return res.status(404).json({ message: 'Note not found or you do not have access to delete.' });
        }

        await prisma.note.delete({
          where: {
            id: noteId,
            userId: userId,
          },
        });

        return res.status(200).json({ message: 'Note permanently deleted successfully!' });
      } catch (error: any) {
        if (error.code === 'P2025') {
          return res.status(404).json({ message: 'Note not found or you do not have access to delete.' });
        }
        console.error(`API: Error permanently deleting note ${noteId}:`, error);
        return res.status(500).json({ message: 'Internal server error while permanently deleting note.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}