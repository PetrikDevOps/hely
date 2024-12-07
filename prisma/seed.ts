interface MigrateJson {
  classes: {
    name: string;
    id?: string;
  }[];
  classrooms: {
    name: string;
    short: string;
    id?: string;
  }[];
  teachers: {
    name: string;
    short: string;
    email: string;
    id?: string;
  }[];
  subjects: {
    name: string;
    short: string;
    id?: string;
  }[];
}

import migrateJson from './migrate-data.json';
import { PrismaClient } from '@prisma/client';

const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createFn = async (prismaCreate: (args: { data: any }) => Promise<{ id: string }>, data: any) => {
  const obj = await prismaCreate({
    data
  });
  return obj.id;
}

const migrate = async () => {
  const data = migrateJson as MigrateJson;
  const prisma = new PrismaClient();

  for (const c of data.classes) {
    c.id = await createFn(prisma.class.create, { name: c.name });
  }

  for (const c of data.classrooms) {
    c.id = await createFn(prisma.room.create, { name: c.name, short: c.short });
  }

  for (const c of data.teachers) {
    c.id = await createFn(prisma.teacher.create, { name: c.name, short: c.short, email: c.email });
  }

  for (const c of data.subjects) {
    c.id = await createFn(prisma.subject.create, { name: c.name, short: c.short });
  }

  for (let i = 0; i < 10; i++) {
    await prisma.substitution.create({
      data: {
        date: new Date(),
        teacherId: getRandomElement(data.teachers).id as string,
        missingTeacherId: getRandomElement(data.teachers).id as string,
        subjectId: getRandomElement(data.subjects).id as string,
        roomId: getRandomElement(data.classrooms).id as string,
        classId: getRandomElement(data.classes).id as string,
        consolidated: Math.random() > 0.4,
        lesson: Math.floor(Math.random() * 5) + 1
      }
    });
  }

  for (let i = 0; i < 5; i++) {
    await prisma.roomSubstitution.create({
      data: {
        date: new Date(),
        fromRoomId: getRandomElement(data.classrooms).id as string,
        toRoomId: getRandomElement(data.classrooms).id as string,
        classId: getRandomElement(data.classes).id as string,
        lesson: Math.floor(Math.random() * 5) + 1
      }
    });
  }

  await prisma.announcement.create({
    data: {
      title: '12.E Fogorvos',
      content: 'A 12.E osztály fogorvosi vizsgálatra megy Koczka István tanár úrral.',
      date: new Date()
    }
  });

  return data;
};

console.log('󰹢 Seeding...');
migrate()
  .then(() => {
    console.log(' Database seeded');
    console.info(`Created:\n- ${migrateJson.classes.length} classes\n- ${migrateJson.classrooms.length} classrooms\n- ${migrateJson.teachers.length} teachers\n- ${migrateJson.subjects.length} subjects`);
  })
  .catch((e) => {
    console.error(e);
  });
