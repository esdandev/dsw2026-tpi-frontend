import AsyncState from '../../shared/components/AsyncState';
import { addDays, formatDateAR } from '../../shared/helpers/dateArgentina';
import {
  getSlotDateKey,
  getSlotId,
  getSlotTimeLabel,
  isSlotAvailable,
} from '../../availabilities/helpers/slot';

const DAY_LABELS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE'];

function SlotSelector({
  weekStart,
  canGoPrev,
  canGoNext,
  onPrevWeek,
  onNextWeek,
  slots,
  loading,
  error,
  onRetry,
  selectedSlot,
  onSelectSlot,
}) {
  const weekDays = DAY_LABELS.map((label, idx) => {
    const dateKey = addDays(weekStart, idx);
    const formatted = formatDateAR(dateKey); // dd/mm/yyyy
    const [dayNumber, monthNumber] = formatted.split('/');

    return {
      label,
      dateKey,
      dayNumber,
      monthNumber,
    };
  });

  const weekEnd = weekDays[4].dateKey;
  const availableSlots = slots.filter(isSlotAvailable);

  const slotsByDate = weekDays.reduce((acc, day) => {
    acc[day.dateKey] = availableSlots
      .filter((slot) => getSlotDateKey(slot) === day.dateKey)
      .sort((a, b) => getSlotTimeLabel(a).localeCompare(getSlotTimeLabel(b)));

    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {/* Navegación semanal */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-med-primary-900">
            Seleccionar Fecha y Horario
          </h2>
          <p className="text-xs text-med-text-sub">
            Semana del {formatDateAR(weekStart)} al {formatDateAR(weekEnd)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevWeek}
            disabled={!canGoPrev}
            aria-label="Semana anterior"
            className="px-3 py-1.5 rounded-lg border border-med-border bg-white text-sm font-semibold text-med-text-main hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            disabled={!canGoNext}
            aria-label="Semana siguiente"
            className="px-3 py-1.5 rounded-lg border border-med-border bg-white text-sm font-semibold text-med-text-main hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={false}
        onRetry={onRetry}
      >
        {!loading && !error && availableSlots.length === 0 && (
          <div className="rounded-lg border border-med-border bg-gray-50 p-3 text-center text-xs text-med-text-sub">
            Sin disponibilidad en esta semana. Probá avanzando a la semana
            siguiente.
          </div>
        )}

        {/* Grilla de 5 columnas Lun-Vie */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {weekDays.map((day) => {
            const daySlots = slotsByDate[day.dateKey] || [];

            return (
              <div
                key={day.dateKey}
                className="flex flex-col rounded-xl border border-med-border bg-white overflow-hidden"
              >
                <div className="bg-med-primary-50/70 border-b border-med-border px-3 py-2.5 text-center">
                  <span className="block text-[11px] font-bold tracking-wider text-med-text-sub">
                    {day.label}
                  </span>
                  <span className="text-sm font-bold text-med-primary-900">
                    {day.dayNumber}/{day.monthNumber}
                  </span>
                </div>

                <div className="flex flex-col gap-2 p-3 min-h-[170px]">
                  {daySlots.length === 0 ? (
                    <p className="my-auto text-center text-xs text-med-text-muted">
                      No hay turnos disponibles para este día.
                    </p>
                  ) : (
                    daySlots.map((slot) => {
                      const slotId = getSlotId(slot);
                      const isSelected =
                        selectedSlot && getSlotId(selectedSlot) === slotId;

                      return (
                        <button
                          key={slotId}
                          type="button"
                          onClick={() => onSelectSlot(slot)}
                          className={`w-full rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-med-primary-900 text-white border-med-primary-900'
                              : 'bg-white text-med-text-main border-med-border hover:border-med-primary-600 hover:bg-med-primary-50/40'
                          }`}
                        >
                          {getSlotTimeLabel(slot)} hs
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </AsyncState>
    </div>
  );
}

export default SlotSelector;
