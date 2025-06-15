import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {

  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;

export async function mockUser() {

  return {
    user: {
      id: 23552355452,
      name: 'Test User',
      email: 'doe.john@faux.com',
      age: 29,
      fullname: {
        firstName: "John",
        lastName: "Doe"
      }
    },
    expires: '2026-06-12T00:00:00.000Z',
  };
}