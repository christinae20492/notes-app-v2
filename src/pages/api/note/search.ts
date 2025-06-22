import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/app/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { q } = req.query;
  const query = Array.isArray(q) ? q[0] : q;

  if (!query || query.trim() === '') {
    return res.status(200).json({ notes: [], foundInFolders: false });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Unauthorized: No active session.' });
  }

  const userId = session.user.id;

  try {

    const searchResults = await prisma.note.findMany({
      where: {
        userId: userId,
        isTrash: false,
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            body: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        dateUpdated: 'desc'
      },
      select: {
        id: true,
        title: true,
        body: true,
        dateCreated: true,
        dateUpdated: true,
        folderId: true,
        tag: true,
        isTrash: true,
        color: true,
        category: true,
      }
    });

    const foundInFolders = searchResults.some(note => note.folderId !== null);

    return res.status(200).json({ notes: searchResults, foundInFolders: foundInFolders });

  } catch (error) {
    console.error("API: Error during note search:", error);
    return res.status(500).json({ message: 'Internal server error during search.' });
  }
}