import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const roomSubstitutions = await prisma.roomSubstitution.findMany({
    include: {
      fromRoom: true,
      toRoom: true,
      class: true
    },
    orderBy: {
      lesson: 'asc'
    }
  });

  const substitutions = await prisma.substitution.findMany({
    include: {
      teacher: true,
      missingTeacher: true,
      subject: true,
      room: true,
      class: true
    },
    orderBy: {
      lesson: 'asc'
    }
  });

  const announcements = await prisma.announcement.findMany();

  // group by date
  const groupedRoomSubstitutions = roomSubstitutions.reduce(
    (acc, substitution) => {
      const date = substitution.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(substitution);
      return acc;
    },
    {} as Record<string, typeof roomSubstitutions>
  );

  // group by date
  const groupedSubstitutions = substitutions.reduce(
    (acc, substitution) => {
      const date = substitution.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(substitution);
      return acc;
    },
    {} as Record<string, typeof substitutions>
  );

  return {
    roomSubstitutions: groupedRoomSubstitutions,
    substitutions: groupedSubstitutions,
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

    return { success: true };
  }
};
