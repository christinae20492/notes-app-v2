import { NextResponse } from 'next/server';
import prisma from '@/app/prisma';
import bcrypt from 'bcryptjs';
import { User } from '@/app/utils/types';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, age } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with that email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        age: age
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ message: 'User registered successfully.', user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error('Error during user registration:', error);
    return NextResponse.json({ message: 'An error occurred during registration.' }, { status: 500 });
  }
}