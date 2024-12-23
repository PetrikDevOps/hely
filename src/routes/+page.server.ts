import type { PageServerLoad, Actions } from './$types';
import type { Announcement, RoomSubstitution, Substitution } from '@prisma/client';
import prisma, { type SessionWithAdapterUser } from '$lib/server/prisma';
import { dayjs } from '$lib/utils';
import { fail } from '@sveltejs/kit';

interface GroupedData {
  roomSubstitutions: RoomSubstitution[];
  substitutions: Substitution[];
  announcements: Announcement[];
}

type GroupedByDate = Record<string, GroupedData>;

// Helper functions
const getDateRange = () => {
  return {
    gt: dayjs().startOf('day').toDate(),
    lt: dayjs().endOf('week').toDate()
  };
};

const createEmptyGroup = (): GroupedData => ({
  roomSubstitutions: [],
  substitutions: [],
  announcements: []
});

const groupItemsByDate = (
  items: (RoomSubstitution | Substitution | Announcement)[],
  groupedData: GroupedByDate,
  key: keyof GroupedData
) => {
  items.forEach((item) => {
    const date = item.date.toISOString();
    if (!groupedData[date]) {
      groupedData[date] = createEmptyGroup();
    }
    (groupedData[date][key] as typeof items).push(item);
  });
};

export const load: PageServerLoad = async ({ locals, url }) => {
  const where: { date: { gt: Date; lt: Date }; classId?: string } = { date: getDateRange() };

  const whereUser: { date: { gt: Date; lt: Date }; classId?: string } = { date: getDateRange() };
  const session = (await locals.auth()) as SessionWithAdapterUser;
  if (session && session.user) {
    if (session.user.classId) whereUser.classId = session.user.classId;
  }

  if (url.searchParams.has('all')) {
    console.log('ASD');
    delete whereUser.classId;
  }

  const [announcements, roomSubstitutions, substitutions] = await Promise.all([
    prisma.announcement.findMany({ where }),
    prisma.roomSubstitution.findMany({
      where: whereUser,
      include: { fromRoom: true, toRoom: true, class: true }
    }),
    prisma.substitution.findMany({
      where: whereUser,
      include: { teacher: true, missingTeacher: true, subject: true, room: true, class: true }
    })
  ]);

  const groupedByDate: GroupedByDate = {};

  groupItemsByDate(roomSubstitutions, groupedByDate, 'roomSubstitutions');
  groupItemsByDate(substitutions, groupedByDate, 'substitutions');
  groupItemsByDate(announcements, groupedByDate, 'announcements');

  return { groupedByDate };
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
