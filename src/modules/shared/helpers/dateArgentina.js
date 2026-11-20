export const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';
export const ARGENTINA_LOCALE = 'es-AR';

function parseUtcDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

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