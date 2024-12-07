import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (events) => {
  const session = await events.locals.auth();

  return {
    session
  };
};
