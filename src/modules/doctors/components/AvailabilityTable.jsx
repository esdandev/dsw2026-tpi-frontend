import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';

function AvailabilityTable({
  schedule,
  saving,
  onToggleDay,
  onUpdateTime,
  onAddRange,
  onRemoveRange,
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-5 border-b border-med-border">
        <h2 className="text-lg font-bold text-med-primary-900">
          Configuración semanal
        </h2>

        <p className="text-sm text-med-text-sub mt-1">
          Activá los días de atención y configurá sus horarios.
        </p>
      </div>

      <div className="divide-y divide-med-border">
        {schedule.map((day) => (
          <div
            key={day.code}
            className="p-4 sm:p-5 flex flex-col lg:flex-row gap-4"
          >
            <div className="flex items-center gap-3 lg:w-44 lg:shrink-0">
              <input
                type="checkbox"
                checked={day.enabled}
                disabled={saving}
                onChange={(event) =>
                  onToggleDay(day.code, event.target.checked)
                }
                aria-label={`Habilitar ${day.label}`}
                className="h-5 w-5 accent-med-primary-900"
              />

              <div>
                <p className="text-sm font-semibold text-med-text-main">
                  {day.label}
                </p>

                <p className="text-xs text-med-text-sub">
                  {day.enabled ? 'Activo' : 'Sin atención'}
                </p>
              </div>
            </div>

            <div className="flex-1">
              {!day.enabled ? (
                <p className="text-sm text-med-text-muted py-2">
                  No se atenderán pacientes este día.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {day.ranges.map((range, index) => (
                    <div
                      key={`${day.code}-${index}`}
                      className="flex flex-wrap items-end gap-3"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-med-text-sub">
                          Entrada
                        </label>

                        <input
                          type="time"
                          value={range.startTime}
                          disabled={saving}
                          onChange={(event) =>
                            onUpdateTime(
                              day.code,
                              index,
                              'startTime',
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-med-border bg-white px-3 py-2 text-sm text-med-text-main"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-med-text-sub">
                          Salida
                        </label>

                        <input
                          type="time"
                          value={range.endTime}
                          disabled={saving}
                          onChange={(event) =>
                            onUpdateTime(
                              day.code,
                              index,
                              'endTime',
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-med-border bg-white px-3 py-2 text-sm text-med-text-main"
                        />
                      </div>

                      {day.ranges.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={saving}
                          onClick={() => onRemoveRange(day.code, index)}
                          className="text-xs text-red-600"
                        >
                          Quitar
                        </Button>
                      )}
                    </div>
                  ))}

                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={saving}
                      onClick={() => onAddRange(day.code)}
                      className="text-xs"
                    >
                      + Agregar otra franja
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default AvailabilityTable;
