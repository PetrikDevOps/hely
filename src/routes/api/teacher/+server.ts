import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';
import { createDataResponse } from '$lib/server/utils';

export const GET: RequestHandler = async () => {
  const teachers = await prisma.teacher.findMany({});

  return createDataResponse(teachers);
}