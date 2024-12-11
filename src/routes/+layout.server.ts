import type { LayoutServerLoad } from './$types';
import prisma, { type SessionWithAdapterUser } from '$lib/server/prisma';

export const load: LayoutServerLoad = async (events) => {
  const session = await events.locals.auth() as SessionWithAdapterUser | null;

  const user = session && (session as SessionWithAdapterUser).user;

  if (user && !user.classId && !user.isAdmin) {
    const classes = await prisma.class.findMany();
    return {
      session,
      classes
    }
  }

  return {
    session
  };
};
