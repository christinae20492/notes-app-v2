import { NextResponse } from 'next/server';
import prisma from '@/app/prisma';
import { authOptions } from '../../auth/[...nextauth]';
import { getSession } from 'next-auth/react';

import { Note, EditNote } from '@/app/utils/types';
import { NextApiRequest, NextApiResponse } from 'next';

interface ItemParams {
  params: {
    id: string;
  };
}


  export async function GET(req: NextApiRequest, res: NextApiResponse, {params}: ItemParams) {

  const session = await getSession({ req, res, authOptions: authOptions });
  const userid = session?.user.id

    if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const note: Note = await prisma.note.findUnique({
      where: {
        id: id,
        userId: userid,
      },
    });

    if (!note) {
      return NextResponse.json({ message: 'Note not found.' }, { status: 404 });
    }

    return NextResponse.json(note, { status: 200 });
  } catch (error) {
    console.error(`Error fetching meals with ID ${id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch meal.' }, { status: 500 });
  }

  }

  export async function PATCH(request: Request, { params }: ItemParams) {
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {

    const body: EditMeals = await request.json();
     if (Object.keys(body).length === 0) {
      return NextResponse.json({ message: 'No fields provided for update.' }, { status: 400 });
    }

    const meal: EditMeals | null = await prisma.ingredient.update({
      where: {
        id: id,
        userId: userid,
      },
      data: {
        ...(body.date !== undefined && { name: body.date }),
        ...(body.breakfast !== undefined && { breakfast: (body.breakfast) }),
        ...(body.lunch !== undefined && { lunch: (body.lunch) }),
        ...(body.dinner !== undefined && { dinner: (body.dinner) }),
        ...(body.snacks !== undefined && { snacks: (body.snacks) }),
      }
    });

    return NextResponse.json(meal, { status: 200 });
  } catch (error) {
    console.error(`Error fetching meal with ID ${id}:`, error);
    return NextResponse.json({ message: 'Failed to fetch meal.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: ItemParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const existingMeal = await prisma.existingMeal.findUnique({
      where: {
        id: id,
        userId: userid,
      },
    });

    if (!existingMeal) {
      return NextResponse.json({ message: 'Meal not found.' }, { status: 404 });
    }

    await prisma.existingMeal.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting meal with ID ${id}:`, error);
    return NextResponse.json({ message: 'Failed to delete meal.' }, { status: 500 });
  }
}