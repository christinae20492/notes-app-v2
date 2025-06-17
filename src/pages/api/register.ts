import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/prisma';
import bcryptjs from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields (username, email, password) are required.' });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username?.toLowerCase() === username.toLowerCase()) {
        return res.status(409).json({ message: 'Username is already taken.' });
      }
      if (existingUser.email?.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({ message: 'Email address is already registered.' });
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
      }
    });

    res.status(201).json({ message: 'User registered successfully! Please sign in.', user: newUser });

  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: 'Internal server error during registration. Please try again later.' });
  }
}