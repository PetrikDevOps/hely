import migrateJson from './migrate-data.json';
import dayjs from 'dayjs';
import { PrismaClient } from '@prisma/client';

const config = {
  substitutionCountRange: { min: 0, max: 10 },
  roomSubstitutionCountRange: { min: 0, max: 10 },
  announcementCountRange: { min: 0, max: 2 },
  daysAhead: 15,
  startDate: dayjs().toDate()
};

interface MigrateJson {
  classes: {
    name: string;
  }[];
  classrooms: {
    name: string;
    short: string;
  }[];
  teachers: {
    name: string;
    short: string;
    email: string;
  }[];
  subjects: {
    name: string;
    short: string;
  }[];
}

interface DBData {
  classes: { id: string }[];
  classrooms: { id: string }[];
  teachers: { id: string }[];
  subjects: { id: string }[];
}

const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const migrate = async () => {
  const data = migrateJson as MigrateJson;
  const dbData: DBData = {
    classes: [],
    classrooms: [],
    teachers: [],
    subjects: []
  };
  const prisma = new PrismaClient();

  dbData.classes = await prisma.class.createManyAndReturn({
    data: data.classes.map((c) => ({ name: c.name }))
  });

  dbData.classrooms = await prisma.room.createManyAndReturn({
    data: data.classrooms.map((c) => ({ name: c.name, short: c.short }))
  });

  dbData.teachers = await prisma.teacher.createManyAndReturn({
    data: data.teachers.map((t) => ({ name: t.name, short: t.short, email: t.email }))
  });

  dbData.subjects = await prisma.subject.createManyAndReturn({
    data: data.subjects.map((s) => ({ name: s.name, short: s.short }))
  });

  for (let i = 0; i < config.daysAhead; i++) {
    const date = dayjs().add(i, 'day').hour(0).minute(0).second(0).millisecond(0).toDate();
    const substitutions = Array.from(
      {
        length: getRandomNumber(
          config.substitutionCountRange.min,
          config.substitutionCountRange.max
        )
      },
      () => ({
        date,
        teacherId: getRandomElement(dbData.teachers).id,
        missingTeacherId: getRandomElement(dbData.teachers).id,
        subjectId: getRandomElement(dbData.subjects).id,
        roomId: getRandomElement(dbData.classrooms).id,
        classId: getRandomElement(dbData.classes).id,
        consolidated: Math.random() > 0.4,
        lesson: Math.floor(Math.random() * 10) + 1
      })
    );

    await prisma.substitution.createMany({
      data: substitutions
    });

    const roomSubstitutions = Array.from(
      {
        length: getRandomNumber(
          config.roomSubstitutionCountRange.min,
          config.roomSubstitutionCountRange.max
        )
      },
      () => ({
        date,
        fromRoomId: getRandomElement(dbData.classrooms).id,
        toRoomId: getRandomElement(dbData.classrooms).id,
        classId: getRandomElement(dbData.classes).id,
        lesson: Math.floor(Math.random() * 10) + 1
      })
    );

    await prisma.roomSubstitution.createMany({
      data: roomSubstitutions
    });

    const announcements = Array.from(
      {
        length: getRandomNumber(
          config.announcementCountRange.min,
          config.announcementCountRange.max
        )
      },
      () => ({
        date,
        title: 'Bejelentés',
        content: 'Ez egy bejelentés a seed.ts-ből. Hello from seed.ts! :D'
      })
    );

    await prisma.announcement.createMany({
      data: announcements
    });

    console.log(` Day ${dayjs(date).format('YYYY-MM-DD')} done`);
  }

  await prisma.class.create({
    data: {
      id: 'test',
      name: 'Teszt osztály'
    }
  });

  await prisma.room.create({
    data: {
      id: 'test',
      name: 'Teszt terem',
      short: 'TT'
    }
  });

  await prisma.teacher.create({
    data: {
      id: 'test',
      name: 'Tesztes Tóni',
      short: 'TTÓni',
      email: 'teszt@petrik.hu'
    }
  });

  await prisma.subject.create({
    data: {
      id: 'test',
      name: 'Teszt tantárgy',
      short: 'TT'
    }
  });

  await prisma.substitution.create({
    data: {
      id: 'test',
      date: dayjs().hour(0).minute(0).second(0).millisecond(0).toDate(),
      teacherId: 'test',
      missingTeacherId: 'test',
      subjectId: 'test',
      roomId: 'test',
      classId: 'test',
      consolidated: false,
      lesson: 1
    }
  });

  await prisma.roomSubstitution.create({
    data: {
      id: 'test',
      date: dayjs().hour(0).minute(0).second(0).millisecond(0).toDate(),
      fromRoomId: 'test',
      toRoomId: 'test',
      classId: 'test',
      lesson: 1
    }
  });

  await prisma.announcement.create({
    data: {
      id: 'test',
      date: dayjs().hour(0).minute(0).second(0).millisecond(0).toDate(),
      title: 'Teszt bejelentés',
      content: 'Ez egy teszt bejelentés a seed.ts-ből. Hello from seed.ts! :D'
    }
  });

  return {
    classes: await prisma.class.count(),
    classrooms: await prisma.room.count(),
    teachers: await prisma.teacher.count(),
    subjects: await prisma.teacher.count(),
    substitutions: await prisma.substitution.count(),
    roomSubstitutions: await prisma.roomSubstitution.count()
  };
};

console.log('󰹢 Seeding...');
// time how long it takes
const start = Date.now();
migrate()
  .then((data) => {
    const end = Date.now();
    console.log(`✔ Database seeded in ${(end - start) / 1000}s`);
    console.info(
      `Created:\n- ${data.classes} classes\n- ${data.classrooms} classrooms\n- ${data.teachers} teachers\n- ${data.subjects} subjects\n- ${data.substitutions} substitutions\n- ${data.roomSubstitutions} room substitutions`
    );
  })
  .catch((e) => {
    console.error(e);
  });
