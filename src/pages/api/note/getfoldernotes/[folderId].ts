import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/app/prisma";
import { getSession } from "next-auth/react";
import { authOptions } from "../../auth/[...nextauth]";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { folderId: queryFolderId } = req.query;
  const folderId = Array.isArray(queryFolderId) ? queryFolderId[0] : queryFolderId;

  if (!folderId) {
    return res.status(400).json({ message: 'Folder ID is required in the URL path.' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    console.warn(`API: Unauthorized attempt to get notes from folder ${folderId} (no session).`);
    return res.status(401).json({ message: 'Unauthorized: No active session.' });
  }

  const userId = session.user.id;
  if (!userId) {
    console.error("API: User ID not found in session for authenticated user.");
    return res.status(400).json({ message: "User ID missing from session." });
  }

  console.log(`API: User ${userId} is requesting notes from folder ${folderId}.`);

  try {

    const notesInFolder = await prisma.note.findMany({
      where: {
        userId: userId,
        isTrash: false,
        folderId: folderId, 
      },
      orderBy: {
        dateCreated: "desc",
      },
    });

    if (notesInFolder.length > 0) {
      console.log('API: First note found (if any):', JSON.stringify(notesInFolder[0], null, 2));
    } else {
      console.log('API: Prisma query returned an empty array for these conditions.');
    }

    return res.status(200).json(notesInFolder);
  } catch (error) {
    console.error(`API: Error fetching notes for folder ${folderId}:`, error);
    return res.status(500).json({ message: "Internal server error while fetching notes." });
  }
}
