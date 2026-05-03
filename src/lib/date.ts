import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from "date-fns";

export function formatEventDate(value: string) {
  const date = parseISO(value);
  if (isToday(date)) {
    return `Today, ${format(date, "HH:mm")}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow, ${format(date, "HH:mm")}`;
  }
  return format(date, "EEE, d MMM, HH:mm");
}

export function relativeEventTime(value: string) {
  return formatDistanceToNow(parseISO(value), { addSuffix: true });
}

export function toInputDateTime(value: Date) {
  return format(value, "yyyy-MM-dd'T'HH:mm");
}
