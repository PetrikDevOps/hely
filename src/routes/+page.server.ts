import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

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

export const actions: Actions = {
  setClass: async ({ request, locals }) => {
    const session = await locals.auth();
    if (!session || !session.user) {
      return fail(401);
    }

    const data = await request.formData();
    const classId = data.get('classId');

    if (!classId) {
      return fail(404);
    }

    const _class = await prisma.class.findUnique({ where: { id: classId as string } });
    
    if (!_class) {
      return fail(404);
    }

    await prisma.user.update({
      where: { id: session.user?.id },
      data: { classId: _class.id }
    });

    return { success: true }
  }
};