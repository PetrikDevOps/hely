// src/routes/api/events/+server.ts
import { createPrismaEndpoint } from '$lib/server/endpoint';
import prisma from '$lib/server/prisma';

export const GET = createPrismaEndpoint({
  model: prisma.lesson,
  orderBy: [{ date: 'desc' }],
  dateHandling: {
    enabled: true,
    field: 'date'
  },
  filters: [{ field: 'classId', operator: 'equals', type: 'string' }]
});
