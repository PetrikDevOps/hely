import type { Session } from '@auth/sveltekit';
import { Prisma, PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

export default prisma;

globalForPrisma.prisma = prisma;

export interface SessionWithAdapterUser extends Session {
  user: Prisma.UserGetPayload<{
    select: {
      id: true;
      name: true;
      email: true;
      classId: true;
      isAdmin: true;
    };
  }>;
}
