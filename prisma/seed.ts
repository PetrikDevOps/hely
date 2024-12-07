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

const migrate = async () => {
  const data = migrateJson as MigrateJson;

  // teachers names have multiple spaces between the names, get rid of them
  data.teachers = data.teachers.map((teacher) => {
    return {
      ...teacher,
      name: teacher.name.replace(/\s+/g, ' '),
      // generate email from name {name}.{name2}.{?name3}@petrik.hu
      email: `${teacher.name.split(' ').join('.').toLowerCase()}@petrik.hu`
    };
  });

  const prisma = new PrismaClient();

  for (const _class of data.classes) {
    const cClass = await prisma.class.create({
      data: {
        name: _class.name
      }
    });
    _class.id = cClass.id;
  }

  for (const classroom of data.classrooms) {
    const cClassroom = await prisma.room.create({
      data: {
        name: classroom.name,
        short: classroom.short
      }
    });
    classroom.id = cClassroom.id;
  }

  for (const teacher of data.teachers) {
    const cTeacher = await prisma.teacher.create({
      data: {
        name: teacher.name,
        short: teacher.short,
        email: teacher.email
      }
    });
    teacher.id = cTeacher.id;
  }

  for (const subject of data.subjects) {
    const cSubject = await prisma.subject.create({
      data: {
        name: subject.name,
        short: subject.short
      }
    });
    subject.id = cSubject.id;
  }

  // create 10 random substitutions, and 5 random room substitutions
  for (let i = 0; i < 10; i++) {
    const randomClass = data.classes[Math.floor(Math.random() * data.classes.length)];
    const randomTeacher = data.teachers[Math.floor(Math.random() * data.teachers.length)];
    const randomSubject = data.subjects[Math.floor(Math.random() * data.subjects.length)];
    const randomClassroom = data.classrooms[Math.floor(Math.random() * data.classrooms.length)];

    await prisma.substitution.create({
      data: {
        date: new Date(),
        teacherId: randomTeacher.id as string,
        subjectId: randomSubject.id as string,
        roomId: randomClassroom.id as string,
        classId: randomClass.id as string,
        consolidated: Math.random() > 0.5,
        lesson: Math.floor(Math.random() * 5) + 1
      }
    });
  }

  for (let i = 0; i < 5; i++) {
    const fromRoom = data.classrooms[Math.floor(Math.random() * data.classrooms.length)];
    const toRoom = data.classrooms[Math.floor(Math.random() * data.classrooms.length)];
    const _class = data.classes[Math.floor(Math.random() * data.classes.length)];

    await prisma.roomSubstitution.create({
      data: {
        date: new Date(),
        fromRoomId: fromRoom.id as string,
        toRoomId: toRoom.id as string,
        classId: _class.id as string,
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
};

migrate()
  .then(() => {
    console.log('Migration successful');
  })
  .catch((e) => {
    console.error(e);
  });
