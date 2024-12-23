import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import huLocale from 'dayjs/locale/hu';

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
