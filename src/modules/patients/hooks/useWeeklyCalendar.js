import { useMemo, useState } from 'react';
import { useDoctorSlots } from '../../availabilities/hooks/useAvailabilities';
import {
  addDays,
  getCurrentMondayAR,
} from '../../shared/helpers/dateArgentina';

const MAX_WEEK_OFFSET = 3;

export function useWeeklyCalendar({ doctorId }) {
  const baseMonday = useMemo(() => getCurrentMondayAR(), []);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(
    () => addDays(baseMonday, weekOffset * 7),
    [baseMonday, weekOffset]
  );
  const weekEnd = useMemo(() => addDays(weekStart, 4), [weekStart]);

  const {
    slots,
    loading: loadingSlots,
    error: slotsError,
    refetch: refetchSlots,
  } = useDoctorSlots({
    doctorId,
    from: weekStart,
    to: weekEnd,
  });

  return {
    weekStart,
    canGoPrev: weekOffset > 0,
    canGoNext: weekOffset < MAX_WEEK_OFFSET,
    goPrevWeek: () => setWeekOffset((week) => Math.max(0, week - 1)),
    goNextWeek: () =>
      setWeekOffset((week) => Math.min(MAX_WEEK_OFFSET, week + 1)),
    slots,
    loadingSlots,
    slotsError,
    refetchSlots,
  };
}
