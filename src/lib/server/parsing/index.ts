import type { ActionResult } from '@sveltejs/kit';
import type { Workbook } from 'exceljs';
import { KretaUtil } from './utils';
import prisma from '../prisma';
import type { Day, WeekType } from '@prisma/client';
import { FALLBACK_EMAIL } from "$env/static/private";

const siftClasses = async (classes: string[][]) => {
  for (const [, name] of classes) {
    const existing = await KretaUtil.getClassId(name, '');
    if (!existing) {
      console.warn(`Class ${name} not found, creating...`);
      await prisma.class.create({
        data: {
          name: KretaUtil.parseClassName(name) as string
        }
      });
    }
  }
};

const siftSubjects = async (subjects: string[][]) => {
  const allSubjects = await prisma.subject.findMany();
  const takenShortNames = allSubjects.map((s) => s.short);
  for (const [, name] of subjects) {
    const existing = await prisma.subject.findFirst({
      where: { name }
    });
    if (!existing) {
      console.warn(`Subject ${name} not found, creating...`);
      await prisma.subject.create({
        data: {
          name,
          short: KretaUtil.abbreviateSubject(name, takenShortNames)
        }
      });
    }
  }
};

const siftTeachers = async (teachers: string[][]) => {
  for (const [, name] of teachers) {
    let email = KretaUtil.findEmail(name);
    if (!email) {
      console.warn(`Email not found for teacher ${name}.`);
      email = FALLBACK_EMAIL;
    }
    const existing = await prisma.teacher.findFirst({ where: { name } });
    if (!existing) {
      console.warn(`Teacher ${name} not found, creating...`);
      await prisma.teacher.create({
        data: {
          name,
          email,
          short: KretaUtil.abbreviatePerson(name)
        }
      });
    }
  }
};

const siftRooms = async (rooms: string[][]) => {
  for (const [, name] of rooms) {
    const existing = await prisma.room.findFirst({ where: { name } });
    if (!existing) {
      console.warn(`Room ${name} not found, creating...`);
      await prisma.room.create({
        data: {
          name,
          short: KretaUtil.abbreviateRoom(name)
        }
      });
    }
  }
};

export const parseKretaExport = async (wb: Workbook): Promise<ActionResult> => {
  const classSheet = wb.getWorksheet('Osztály');
  const subjectSheet = wb.getWorksheet('Tantárgy');
  const teacherSheet = wb.getWorksheet('Tanár');
  const roomSheet = wb.getWorksheet('Helyiség');
  const timetableSheet = wb.getWorksheet('Órarend');

  if (!classSheet || !subjectSheet || !teacherSheet || !roomSheet || !timetableSheet) {
    return {
      type: 'failure',
      status: 400,
      data: { message: 'Hiányos Excel fájl!' }
    };
  }

  const classes = classSheet
    .getSheetValues()
    .filter((row): row is string[] => Array.isArray(row));
  const subjects = subjectSheet
    .getSheetValues()
    .filter((row): row is string[] => Array.isArray(row));
  const teachers = teacherSheet
    .getSheetValues()
    .filter((row): row is string[] => Array.isArray(row));
  const rooms = roomSheet
    .getSheetValues()
    .filter((row): row is string[] => Array.isArray(row));

  await Promise.all([
    siftClasses(classes),
    siftSubjects(subjects),
    siftTeachers(teachers),
    siftRooms(rooms)
  ]);

  await prisma.lesson.deleteMany();

  const lessonsToCreate: {
    weekType: string;
    weekDay: string;
    lessonNumber: number;
    className: string[];
    subjectName: string;
    teacherName: string;
    roomName: string;
  }[] = [];

  timetableSheet.eachRow((row, index) => {
    if (index === 1) return; // skip header row

    const weekType = KretaUtil.getWeekType(row.getCell(1).value);
    const weekDay = KretaUtil.getWeekDay(row.getCell(2).value);
    const lessonNumber = Number(row.getCell(3).value);
    const className = [row.getCell(4).value as string, row.getCell(5).value as string];
    const subjectName = row.getCell(6).value as string;
    const teacherName = row.getCell(7).value as string;
    const roomName = row.getCell(8).value as string;

    if (!weekType || !weekDay || !lessonNumber || !subjectName || !teacherName || !roomName) {
      console.warn('Skipping invalid row...');
      console.log(weekType, weekDay, lessonNumber, className, subjectName, teacherName, roomName);
      return;
    }
      lessonsToCreate.push({
        weekType,
        weekDay,
        lessonNumber,
        className,
        subjectName,
        teacherName,
        roomName
      });
  });

  console.log(lessonsToCreate.length, "lessons to create");

  // create lessons

  const lessonPromises = lessonsToCreate.map(async (lesson) => {
    const subject = await prisma.subject.findFirst({
      where: { name: lesson.subjectName }
    });
    const teacher = await prisma.teacher.findFirst({
      where: { name: lesson.teacherName }
    });
    const room = await prisma.room.findFirst({
      where: { name: lesson.roomName }
    });

    if (!subject || !teacher || !room) {
      console.warn('Skipping invalid lesson...');
      console.log(lesson);
      console.log(subject, teacher, room);
      return;
    }

    const weekType = lesson.weekType as WeekType;
    const weekDay = lesson.weekDay as Day;
    const classId = await KretaUtil.getClassId(lesson.className[0], lesson.className[1]);

    if (Array.isArray(classId)) {
      for (const id of classId) {
        await prisma.lesson.create({
          data: {
            weekType,
            day: weekDay,
            lesson: lesson.lessonNumber,
            classId: id,
            group: lesson.className[1],
            subjectId: subject.id,
            teacherId: teacher.id,
            roomId: room.id
          }
        });
      }
      return;
    }

    await prisma.lesson.create({
      data: {
        weekType,
        day: weekDay,
        lesson: lesson.lessonNumber,
        classId: classId,
        subjectId: subject.id,
        teacherId: teacher.id,
        roomId: room.id
      }
    });
  });

  await Promise.all(lessonPromises);

  const lessonCount = await prisma.lesson.count();

  return {
    type: 'success',
    status: 200,
    data: { message: `${lessonCount} óra létrehozva!` }
  };
};
