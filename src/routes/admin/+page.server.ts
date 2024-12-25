import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import exceljs from 'exceljs';
import { parseKretaExport } from '$lib/server/parsing';
import { dayjs, parseDate } from "$lib/utils";
import prisma from '$lib/server/prisma';

export const load = async ({ parent }) => {
  const parentData = await parent();

  if (!parentData.session || !parentData.session.user.isAdmin) {
    redirect(302, '/');
  }

  const classes = await prisma.class.findMany();
  const lessons = await prisma.lesson.findMany({ include: { subject: true, teacher: true } });
  const teachers = await prisma.teacher.findMany();
  const rooms = await prisma.room.findMany();

  return {
    classes,
    lessons,
    teachers,
    rooms
  };
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
  },

  newSubstitution: async ({ request }) => {
    const formData = await request.formData();

    const date = parseDate(formData.get('date') as string).toDate();
    console.log(date);
    const missingTeacherId = formData.get('missingTeacherId') as string;
    const teacherId = formData.get('teacherId') as string;
    const subjectId = formData.get('subjectId') as string;
    const roomId = formData.get('roomId') as string;
    const classId = formData.get('classId') as string;
    const classGroup = formData.get('classGroup') as string;
    const consolidated = formData.get('consolidated') === 'true';
    const lesson = parseInt(formData.get('lesson') as string);

    if (!date || !missingTeacherId || !teacherId || !subjectId || !roomId || !classId || !lesson) {
      return fail(400, { message: 'Hiányzó adatok!' });
    }

    try {
      await prisma.substitution.create({
        data: {
          date,
          missingTeacherId,
          teacherId,
          subjectId,
          roomId,
          classId,
          classGroup,
          consolidated,
          lesson
        }
      });
    } catch (e) {
      console.error(e);
      return fail(400, { message: 'Hibás adatok!' });
    }
  }
};
