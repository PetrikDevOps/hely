// src/routes/api/events/+server.ts
import { createFilteredPrismaEndpoint } from '$lib/server/endpoint';
import prisma from '$lib/server/prisma';

export const GET = createFilteredPrismaEndpoint({
  model: prisma.substitution,
  include: {
    teacher: true,
    missingTeacher: true,
    subject: true,
    room: true,
    class: true
  },
  dateField: 'date',
  filters: [
    { field: 'date', operator: 'gte', type: 'date' },
    { field: 'classId', operator: 'equals', type: 'string' },
    { field: 'lesson', operator: 'equals', type: 'number' },
    { field: 'teacherId', operator: 'equals', type: 'string' },
    { field: 'missingTeacherId', operator: 'equals', type: 'string' },
    { field: 'subjectId', operator: 'equals', type: 'string' },
    { field: 'roomId', operator: 'equals', type: 'string' }
  ]
})