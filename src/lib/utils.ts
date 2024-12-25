import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import huLocale from 'dayjs/locale/hu';
import { Day } from '@prisma/client';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.locale(huLocale);

export { dayjs };

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function parseDate(date: string): dayjs.Dayjs {
  const parsed = dayjs.tz(date, 'UTC');
  parsed.tz('Europe/Budapest');
  return parsed;
}

export function getDay(date?: string) {
  let dateVal = dayjs();
  if (date) {
    dateVal = parseDate(date);
  }
  switch (dateVal.day()) {
    case 0:
      return Day.Sunday;
    case 1:
      return Day.Monday;
    case 2:
      return Day.Tuesday;
    case 3:
      return Day.Wednesday;
    case 4:
      return Day.Thursday;
    case 5:
      return Day.Friday;
    case 6:
      return Day.Saturday;
  }
}