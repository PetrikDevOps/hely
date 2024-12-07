// src/routes/api/events/+server.ts
import { createPrismaEndpoint } from '$lib/server/endpoint';
import prisma from '$lib/server/prisma';

export const GET = createPrismaEndpoint({
  model: prisma.roomSubstitution,
  orderBy: { date: 'desc' },
  dateField: 'date'
});