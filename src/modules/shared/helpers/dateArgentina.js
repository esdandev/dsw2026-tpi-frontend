export const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';
export const ARGENTINA_LOCALE = 'es-AR';

function parseUtcDate(value) {
  if (!value) return null;

  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return new Date(`${trimmed}T12:00:00Z`);
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(trimmed)) {
      return new Date(`${trimmed}Z`);
    }
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateAR(utcInput, options = {}) {
  const date = parseUtcDate(utcInput);

  if (!date) return '';

  return new Intl.DateTimeFormat(ARGENTINA_LOCALE, {
    timeZone: ARGENTINA_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatTimeAR(utcInput, options = {}) {
  const date = parseUtcDate(utcInput);

  if (!date) return '';

  return new Intl.DateTimeFormat(ARGENTINA_LOCALE, {
    timeZone: ARGENTINA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    ...options,
  }).format(date);
}

export function formatDateTimeAR(utcInput) {
  const date = parseUtcDate(utcInput);

  if (!date) return '';

  return new Intl.DateTimeFormat(ARGENTINA_LOCALE, {
    timeZone: ARGENTINA_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function addDays(yyyyMmDd, days) {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));

  return toApiDateFilter(utc);
}

export function getCurrentMondayAR() {
  const todayStr = toApiDateFilter(new Date());
  const [y, m, d] = todayStr.split('-').map(Number);
  const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: ARGENTINA_TIMEZONE,
    weekday: 'short',
  }).format(utcNoon);

  const offsetMap = {
    Mon: 0,
    Tue: -1,
    Wed: -2,
    Thu: -3,
    Fri: -4,
    Sat: 2,
    Sun: 1,
  };

  const diff = offsetMap[weekday] ?? 0;

  return toApiDateFilter(new Date(Date.UTC(y, m - 1, d + diff, 12, 0, 0)));
}

export function toApiDateFilter(input) {
  if (!input) return '';

  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    return input.trim();
  }

  const date = parseUtcDate(input);

  if (!date) return '';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ARGENTINA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;

  return year && month && day ? `${year}-${month}-${day}` : '';
}
