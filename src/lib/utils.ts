import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import huLocale from 'dayjs/locale/hu';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(huLocale);

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseDate (date: string): dayjs.Dayjs {
  const parsed = dayjs.tz(date, 'UTC');
  parsed.tz('Europe/Budapest');
  return parsed;
}