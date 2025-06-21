import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import prisma from '@/app/prisma';
import { EditFolder } from '@/app/utils/types'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const folderId = Array.isArray(id) ? id[0] : id;

  if (!folderId) {
    return res.status(400).json({ message: 'Folder ID is required.' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.warn(`API: Unauthorized attempt to ${req.method} folder (no session). Folder ID: ${folderId}`);
    return res.status(401).json({ message: 'Unauthorized: No active session.' });
  }

  const userId = session.user.id;
  if (!userId) {
    console.error("API: User ID not found in session for authenticated user.");
    return res.status(400).json({ message: 'User ID missing from session.' });
  }

  switch (req.method) {
    case 'GET':
      console.log(`API: User ${userId} is requesting folder with ID: ${folderId}`);
      try {
        const folder = await prisma.folder.findUnique({
          where: {
            id: folderId,
            userId: userId,
          },
        });

        if (!folder) {
          return res.status(404).json({ message: 'Folder not found or you do not have access.' });
        }

        return res.status(200).json(folder);
      } catch (error) {
        console.error(`API: Error fetching note ${folderId}:`, error);
        return res.status(500).json({ message: 'Internal server error while fetching folder.' });
      }

    case 'PATCH':
      console.log(`API: User ${userId} is attempting to update folder with ID: ${folderId}`);
      const updateData: EditFolder = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
      }

      try {
        const updatedFolder = await prisma.folder.update({
          where: {
            id: folderId,
            userId: userId,
          },
          data: {
            ...updateData,
            dateUpdated: new Date(),
          },
        });

        return res.status(200).json({ message: 'Folder updated successfully!', folder: updatedFolder });
      } catch (error: any) {
        if (error.code === 'P2025') {
          return res.status(404).json({ message: 'Folder not found or you do not have access to update.' });
        }
        console.error(`API: Error updating note ${folderId}:`, error);
        return res.status(500).json({ message: 'Internal server error while updating folder.' });
      }

    case 'DELETE':
      console.log(`API: User ${userId} is attempting to PERMANENTLY DELETE folder with ID: ${folderId}`);
      try {
        const folderToDelete = await prisma.folder.findUnique({
            where: {
                id: folderId,
                userId: userId,
            }
        });

        if (!folderToDelete) {
            return res.status(404).json({ message: 'Folder not found or you do not have access to delete.' });
        }

        await prisma.folder.delete({
          where: {
            id: folderId,
            userId: userId,
          },
        });

        return res.status(200).json({ message: 'Folder permanently deleted!' });
      } catch (error: any) {
        if (error.code === 'P2025') {
          return res.status(404).json({ message: 'Folder not found or you do not have access to delete.' });
        }
        console.error(`API: Error permanently deleting note ${folderId}:`, error);
        return res.status(500).json({ message: 'Internal server error while permanently deleting folder.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}