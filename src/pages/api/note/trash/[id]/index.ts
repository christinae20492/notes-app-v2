import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/app/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const noteId = Array.isArray(id) ? id[0] : id;

  if (!noteId) {
    return res.status(400).json({ message: 'Note ID is required.' });
  }

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.warn(`API: Unauthorized attempt to trash note (no session). Note ID: ${noteId}`);
    return res.status(401).json({ message: 'Unauthorized: No active session.' });
  }

  const userId = session.user.id;
  if (!userId) {
    console.error("API: User ID not found in session for authenticated user.");
    return res.status(400).json({ message: 'User ID missing from session.' });
  }

  console.log(`API: User ${userId} is moving note ${noteId} to trash.`);

  try {
    const trashedNote = await prisma.note.update({
      where: {
        id: noteId,
        userId: userId,
        isTrash: false,
      },
      data: {
        isTrash: true,
        dateDeleted: new Date(),
        dateUpdated: new Date(),
      },
    });

    return res.status(200).json({ message: 'Note moved to trash successfully!', note: trashedNote });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Note not found or you do not have access to trash.' });
    }
    console.error(`API: Error trashing note ${noteId}:`, error);
    return res.status(500).json({ message: 'Internal server error while trashing note.' });
  }
}