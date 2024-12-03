import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from "@auth/prisma-adapter"
import EntraID from '@auth/sveltekit/providers/microsoft-entra-id';
import prisma from '$lib/server/prisma';

import { AUTH_SECRET, ENTRA_ID_ID, ENTRA_ID_ISSUER, ENTRA_ID_SECRET } from '$env/static/private';

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
  adapter: PrismaAdapter(prisma)
});
