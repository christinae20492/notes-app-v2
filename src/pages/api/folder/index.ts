import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/app/prisma";
import { getSession } from "next-auth/react";
import { authOptions } from "../auth/[...nextauth]";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession( req, res, authOptions );

  if (!session) {
    console.warn(`API: Unauthorized attempt to ${req.method} folders (no session).`);
        console.log(req.headers)
    return res.status(401).json({ message: 'Unauthorized: No active session.' });
  }

  const userId = session.user.id;
  if (!userId) {
    console.error("API: User ID not found in session for authenticated user.");
    return res.status(400).json({ message: 'User ID missing from session.' });
  }

  switch (req.method) {

    case 'GET':
      console.log(`API: User ${userId} is requesting all folders.`);
      try {
        const allFolders = await prisma.folder.findMany({
          where: {
            userId: userId,
          },
          orderBy: {
            dateCreated: 'desc',
          },
        });
        return res.status(200).json(allFolders);
      } catch (error) {
        console.error("API: Error fetching folders:", error);
        return res.status(500).json({ message: 'Internal server error while fetching folders.' });
      }

    case 'POST':
      console.log(`API: User ${userId} is attempting to create a folder.`);
      const { title, notes } = req.body;

      if (!title ) {
        return res.status(400).json({ message: 'Title is required.' });
      }

      try {
        const newFolder = await prisma.folder.create({
          data: {
            id: uuidv4(),
            title,
           notes,
            userId: userId,
          },
        });
        return res.status(201).json({ message: 'Folder created successfully!', folder: newFolder });
      } catch (error) {
        console.error("API: Error creating folder:", error);
        return res.status(500).json({ message: 'Failed to create folder.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}