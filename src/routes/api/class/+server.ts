import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';
import { createDataResponse } from '$lib/server/utils';

export const GET: RequestHandler = async () => {
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true
    }
  });

  return createDataResponse(classes);
};
