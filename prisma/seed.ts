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
import dayjs from 'dayjs';
import { PrismaClient } from '@prisma/client';

const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
}

const createFn = async (
  prismaCreate: (_) => Promise<{ id: string }>,
  data: { [key: string]: string }
) => {
  const obj = await prismaCreate({
    data
  });
  return obj.id;
};

const createRandomSubstitutions = async (prisma: PrismaClient, data: MigrateJson, date: Date) => {
  for (let i = 0; i < getRandomNumber(5, 30); i++) {
    await prisma.substitution.create({
      data: {
        date,
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
};

const createRandomRoomSubstitutions = async (prisma: PrismaClient, data: MigrateJson, date: Date) => {
  for (let i = 0; i < getRandomNumber(2, 20); i++) {
    await prisma.roomSubstitution.create({
      data: {
        date,
        fromRoomId: getRandomElement(data.classrooms).id as string,
        toRoomId: getRandomElement(data.classrooms).id as string,
        classId: getRandomElement(data.classes).id as string,
        lesson: Math.floor(Math.random() * 5) + 1
      }
    });
  }
};

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

  for (let i = -15; i < 15; i++) {
    const currentDate = dayjs().add(i, 'day').toDate();
    await createRandomSubstitutions(prisma, data, currentDate);
    await createRandomRoomSubstitutions(prisma, data, currentDate);
    await prisma.announcement.create({ data: { date: currentDate, title: 'Test announcement', content: "This is a test announcement for some day that I'm too lazy to template in here. Hello from seed.ts! :D" } });
    console.log(` Created data for ${dayjs(currentDate).format('YYYY-MM-DD')}`);
  }


  return {
    classes: await prisma.class.count(),
    classrooms: await prisma.room.count(),
    teachers: await prisma.teacher.count(),
    subjects: await prisma.teacher.count(),
    substitutions: await prisma.substitution.count(),
    roomSubstitutions: await prisma.roomSubstitution.count()
  }
};

console.log('󰹢 Seeding...');
migrate()
  .then((data) => {
    console.log('✔ Database seeded');
    console.info(
      `Created:\n- ${data.classes} classes\n- ${data.classrooms} classrooms\n- ${data.teachers} teachers\n- ${data.subjects} subjects\n- ${data.substitutions} substitutions\n- ${data.roomSubstitutions} room substitutions`
    );
  })
  .catch((e) => {
    console.error(e);
  });
