// src/routes/api/events/+server.ts
import { createPrismaEndpoint } from '$lib/server/endpoint';
import prisma from '$lib/server/prisma';

export const GET = createPrismaEndpoint({
  model: prisma.substitution,
  include: {
    teacher: true,
    missingTeacher: true,
    subject: true,
    room: true,
    class: true
  },
  dateHandling: {
    enabled: true,
    field: 'date'
  },
  filters: [
    { field: 'date', operator: 'gte', type: 'date' },
    { field: 'classId', operator: 'equals', type: 'string' },
    { field: 'lesson', operator: 'equals', type: 'number' },
    { field: 'teacherId', operator: 'equals', type: 'string' },
    { field: 'missingTeacherId', operator: 'equals', type: 'string' },
    { field: 'subjectId', operator: 'equals', type: 'string' },
    { field: 'roomId', operator: 'equals', type: 'string' }
  ]
});
