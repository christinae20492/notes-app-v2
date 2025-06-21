import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/app/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.warn(`API: Unauthorized attempt to PERMANENTLY delete multiple notes (no session).`);
    return res.status(401).json({ message: 'Unauthorized: No active session.' });
  }

  const userId = session.user.id;
  if (!userId) {
    console.error("API: User ID not found in session for authenticated user.");
    return res.status(400).json({ message: 'User ID missing from session.' });
  }

  const { noteIds } = req.body;

  if (!Array.isArray(noteIds) || noteIds.length === 0) {
    return res.status(400).json({ message: 'An array of note IDs is required in the request body.' });
  }

  console.log(`API: User ${userId} is PERMANENTLY deleting notes with IDs [${noteIds.join(', ')}].`);

  try {
  
    const { count } = await prisma.note.deleteMany({
      where: {
        id: {
          in: noteIds,
        },
        userId: userId,
        isTrash: true,
      },
    });

    if (count === 0) {
        return res.status(404).json({ message: 'No notes found in trash for the authenticated user with the provided IDs to delete.' });
    }

    return res.status(200).json({
      message: `${count} notes permanently deleted successfully!`,
      count: count,
    });
  } catch (error) {
    console.error(`API: Error permanently deleting multiple notes for user ${userId}:`, error);
    return res.status(500).json({ message: 'Internal server error while deleting multiple notes.' });
  }
}