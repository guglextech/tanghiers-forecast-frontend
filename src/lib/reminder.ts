const STORAGE_KEY = 'tg.forecast-toast.v1';
export const REMINDER_HOUR = 14;

export function localDateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function alreadyRemindedToday() {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === localDateKey();
  } catch {
    return false;
  }
}

export function markRemindedToday() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, localDateKey());
}

/** Milliseconds until the next 2:00 PM in the user's local timezone. */
export function msUntilNextReminder(now = new Date()) {
  const next = new Date(now);
  next.setHours(REMINDER_HOUR, 0, 0, 0);
  if (now.getTime() >= next.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

export function isAtOrAfterReminder(now = new Date()) {
  return now.getHours() > REMINDER_HOUR || (now.getHours() === REMINDER_HOUR && now.getMinutes() >= 0);
}
