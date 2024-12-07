import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export async function GET() {
	const classes = await prisma.class.findMany();

  return json(classes);
}