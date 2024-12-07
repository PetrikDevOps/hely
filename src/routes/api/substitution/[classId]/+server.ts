import { createParameterizedPrismaEndpoint } from '$lib/server/endpoint';
import prisma from '$lib/server/prisma';

export const GET = createParameterizedPrismaEndpoint({
  model: prisma.substitution,
  paramName: 'classId',
  paramValidation: {
    checkExists: true,
    existsModel: prisma.class
  },
  include: {
    teacher: true,
    missingTeacher: true,
    subject: true,
    room: true,
    class: true
  },
  orderBy: [
    { date: 'asc' },
    { lesson: 'asc' }
  ]
});