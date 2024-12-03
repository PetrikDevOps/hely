import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
  const roomSubstitutions = await prisma.roomSubstitution.findMany();
  const substitutions = await prisma.substitution.findMany();
  const announcements = await prisma.announcement.findMany();

  return {
    roomSubstitutions,
    substitutions,
    announcements
  };
};
