import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/app/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.warn(`API: Unauthorized attempt to remove multiple notes from folder (no session).`);
    return res.status(401).json({ message: 'Unauthorized: No active session.' });
  }

  const userId = session.user.id;
  if (!userId) {
    console.error("API: User ID not found in session for authenticated user.");
    return res.status(400).json({ message: 'User ID missing from session.' });
  }

  const { noteIds, folderId } = req.body;

  if (!Array.isArray(noteIds) || noteIds.length === 0) {
    return res.status(400).json({ message: 'An array of note IDs is required in the request body.' });
  }

  console.log(`API: User ${userId} is removing notes with IDs [${noteIds.join(', ')}] from folder ${folderId}.`);

  try {
    const { count } = await prisma.note.updateMany({
      where: {
        id: {
          in: noteIds,
        },
        userId: userId,
        folderId: folderId,
      },
      data: {
        folderId: null,
        dateDeleted: new Date(),
        dateUpdated: new Date(),
      },
    });

    return res.status(200).json({
      message: `${count} notes taken from folder ${folderId} successfully!`,
      count: count,
    });
  } catch (error) {
    console.error(`API: Error moving notes from folder:`, error);
    return res.status(500).json({ message: 'Internal server error while moving notes.' });
  }
}
