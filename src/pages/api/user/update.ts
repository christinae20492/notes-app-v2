import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/app/prisma';
import bcryptjs from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow PATCH method for updating user data
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // 1. Authenticate the user session
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Unauthorized: No active session.' });
  }

  const userId = session.user.id;
  const { username, email, currentPassword, newPassword } = req.body;

  const updateData: {
    username?: string;
    email?: string;
    password?: string;
  } = {};

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (username !== undefined) {
      const trimmedUsername = username.trim();
      if (trimmedUsername === '') {
        return res.status(400).json({ message: 'Username cannot be empty.' });
      }
      if (trimmedUsername !== user.username) {
        updateData.username = trimmedUsername;
      }
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail === '') {
        return res.status(400).json({ message: 'Email cannot be empty.' });
      }
      if (trimmedEmail !== user.email) {
        updateData.email = trimmedEmail;
      }
    }

    if (newPassword !== undefined) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password.' });
      }
      if (!user.password) {
        return res.status(400).json({ message: 'No existing password found for user to verify.' });
      }

      const isValidCurrentPassword = await bcryptjs.compare(currentPassword, user.password);
      if (!isValidCurrentPassword) {
        return res.status(401).json({ message: 'Incorrect current password.' });
      }

      const trimmedNewPassword = newPassword.trim();
      if (trimmedNewPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
      }

      updateData.password = await bcryptjs.hash(trimmedNewPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: 'No changes detected to update.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    return res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });

  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && Array.isArray(target)) {
        if (target.includes('username')) {
          return res.status(409).json({ message: 'Username is already taken.' });
        }
        if (target.includes('email')) {
          return res.status(409).json({ message: 'Email is already in use.' });
        }
      }
    }
    console.error("API: Error updating user profile:", error);
    return res.status(500).json({ message: 'Internal server error during profile update.' });
  }
}
