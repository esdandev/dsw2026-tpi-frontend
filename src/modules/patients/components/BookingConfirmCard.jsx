import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';

function BookingConfirmCard({
  displayError,
  successMessage,
  reason,
  reasonError,
  fieldErrorReason,
  onReasonChange,
  submitting,
  hasSelectedSlot,
  selectedSlotStart,
  dateLabel,
  timeLabel,
  onConfirm,
  onGoAppointments,
}) {
  return (
    <Card className="p-6 sm:p-7 flex flex-col gap-4">
      {displayError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
        >
          {displayError} — Elegí otro horario disponible.
        </div>
      )}

      {successMessage && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
          <span>{successMessage}</span>
          <Button
            type="button"
            onClick={onGoAppointments}
            className="bg-med-primary-900 text-white text-xs"
          >
            Ver Mis Turnos
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="booking-reason"
          className="text-xs font-semibold text-med-text-main"
        >
          Motivo de consulta
        </label>
        <textarea
          id="booking-reason"
          rows={3}
          aria-invalid={reasonError || fieldErrorReason ? 'true' : undefined}
          placeholder="Describa brevemente el motivo de su consulta (mínimo 5 caracteres)..."
          value={reason}
          onChange={onReasonChange}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 ${
            reasonError || fieldErrorReason
              ? 'border-red-500 focus:ring-red-500'
              : 'border-med-border focus:ring-med-primary-600'
          }`}
        />
        {(reasonError || fieldErrorReason) && (
          <span role="alert" className="text-xs text-red-600">
            {reasonError || fieldErrorReason}
          </span>
        )}
      </div>

      {/* Barra de resumen y botón Confirmar Turno */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-med-border">
        <div className="text-xs sm:text-sm text-med-text-sub">
          {hasSelectedSlot && selectedSlotStart ? (
            <span>
              Turno seleccionado:{' '}
              <strong className="text-med-primary-900">{dateLabel}</strong> a
              las{' '}
              <strong className="text-med-primary-900">{timeLabel} hs</strong>
            </span>
          ) : (
            <span>Ningún horario seleccionado todavía.</span>
          )}
        </div>

        <Button
          type="button"
          disabled={!hasSelectedSlot || submitting}
          onClick={onConfirm}
          className="bg-med-primary-900 hover:bg-med-primary-800 text-white disabled:opacity-50"
        >
          {submitting ? 'Confirmando...' : 'Confirmar Turno'}
        </Button>
      </div>
    </Card>
  );
}

export default BookingConfirmCard;
