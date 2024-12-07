import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from "@auth/prisma-adapter"
import EntraID from '@auth/sveltekit/providers/microsoft-entra-id';
import prisma from '$lib/server/prisma';

import { AUTH_SECRET, ENTRA_ID_ID, ENTRA_ID_ISSUER, ENTRA_ID_SECRET, ROOT_USER_ID } from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  providers: [
    EntraID({
      clientId: ENTRA_ID_ID,
      clientSecret: ENTRA_ID_SECRET,
      issuer: ENTRA_ID_ISSUER
    })
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async ({ session }) => {
      // FIXME: (nemvince)
      // This is a workaround for the issue where the user model
      // is not loaded in the session object. This is a temporary solution!
      return session;
    },
    signIn: async ({ user, profile }) => {
      if (profile?.oid === ROOT_USER_ID) {
        const userExists = await prisma.user.findUnique({
          where: { id: user.id }
        });

        if (userExists) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isAdmin: true
            }
          });
        }
      }

      return true;
    }
  }
});
