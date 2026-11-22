import {
  formatTimeAR,
  toApiDateFilter,
} from '../../shared/helpers/dateArgentina.js';

export function getSlotId(slot) {
  return slot?.availabilitySlotId ?? slot?.id;
}

export function isSlotAvailable(slot) {
  if (typeof slot?.isAvailable === 'boolean') return slot.isAvailable;

  if (typeof slot?.available === 'boolean') return slot.available;

  if (slot?.status) return slot.status.toUpperCase() === 'AVAILABLE';

  return true;
}

export function getSlotStart(slot) {
  return (
    slot?.startTime || slot?.startAt || slot?.dateTime || slot?.start || null
  );
}

export function getSlotDateKey(slot) {
  return toApiDateFilter(slot?.date || getSlotStart(slot));
}

export function getSlotTimeLabel(slot) {
  if (
    typeof slot?.startTime === 'string' &&
    /^\d{2}:\d{2}/.test(slot.startTime)
  ) {
    return slot.startTime.slice(0, 5);
  }

  return formatTimeAR(getSlotStart(slot));
}
