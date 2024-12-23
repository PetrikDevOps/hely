import { createPrismaEndpoint } from '$lib/server/endpoint';
import prisma from '$lib/server/prisma';

export const GET = createPrismaEndpoint({
  model: prisma.substitution,
  paramConfig: {
    name: 'teacherId',
    checkExists: true,
    existsModel: prisma.teacher
  },
  include: {
    teacher: true,
    missingTeacher: true,
    subject: true,
    room: true,
    class: true
  },
  orderBy: [{ date: 'asc' }, { lesson: 'asc' }]
});
