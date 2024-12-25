// src/routes/api/events/+server.ts
import { createPrismaEndpoint } from '$lib/server/endpoint';
import prisma from '$lib/server/prisma';
import { getDay } from '$lib/utils';

export const GET = createPrismaEndpoint({
  model: prisma.lesson,
  filters: [{ field: 'classId', operator: 'equals', type: 'string' }],
  dateHandling: {
    enabled: false
  },
  additionalWhere: {
    day: getDay()
  },
  include: {
    subject: true,
    teacher: true,
    room: true
  }
});
