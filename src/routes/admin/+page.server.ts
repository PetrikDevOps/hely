import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import exceljs from 'exceljs';
import { parseKretaExport } from '$lib/server/parsing';

export const load = async ({ parent }) => {
  const parentData = await parent();

  if (!parentData.session || !parentData.session.user.isAdmin) {
    redirect(302, '/');
  }
};

export const actions: Actions = {
  importXlsx: async ({ request }) => {
    const formData = await request.formData();

    if (!formData.has('file')) {
      return fail(400, { message: 'Nincs fájl!' });
    }

    try {
      const file = formData.get('file') as File;
      const buffer = await file.arrayBuffer();
      const workbook = new exceljs.Workbook();
      await workbook.xlsx.load(buffer);

      return await parseKretaExport(workbook);
    } catch (e) {
      console.error(e);
      return fail(400, { message: 'Hibás fájl!' });
    }
  }
};
