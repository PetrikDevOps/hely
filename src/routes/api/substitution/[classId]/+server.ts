import type { RequestHandler } from './$types';
import dayjs from 'dayjs';
import prisma from '$lib/server/prisma';
import { createDataResponse, createErrorResponse } from '$lib/server/utils';

export const GET: RequestHandler = async ({ url, params }) => {
  const classId = params.classId;
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  if (!classId) {
    return createErrorResponse(400, 'Missing classId');
  }

  const classExists = prisma.class.findFirst({
    where: {
      id: classId
    }
  });

  if (!classExists) {
    return createErrorResponse(404, 'Class not found');
  }

  if (startDate && endDate) {
    try {
      const a = dayjs(startDate);
      const b = dayjs(endDate);
      if (a.isAfter(b)) {
        return createErrorResponse(400, 'startDate is after endDate');
      }
      if (a.isBefore(dayjs().startOf('day')) || b.isBefore(dayjs().startOf('day'))) {
        return createErrorResponse(400, 'startDate or endDate is in the past');
      }
    } catch {
      return createErrorResponse(400, 'Invalid date format');
    }
    const substitutions = await prisma.substitution.findMany({
      where: {
        date: {
          gte: dayjs(startDate).startOf('day').toDate(),
          lte: dayjs(endDate).endOf('day').toDate()
        },
        classId
      },
      include: {
        teacher: true,
        missingTeacher: true,
        subject: true,
        room: true,
        class: true
      },
      orderBy: [
        {
          date: 'asc'
        },
        {
          lesson: 'asc'
        }
      ]
    });

    return createDataResponse(substitutions);
  }
  
  const substitutions = await prisma.substitution.findMany({
    where: {
      date: {
        gte: dayjs().startOf('day').toDate()
      },
      classId
    },
    include: {
      teacher: true,
      missingTeacher: true,
      subject: true,
      room: true,
      class: true
    },
    orderBy: [
      {
        date: 'asc'
      },
      {
        lesson: 'asc'
      }
    ]
  });

  return createDataResponse(substitutions);
}