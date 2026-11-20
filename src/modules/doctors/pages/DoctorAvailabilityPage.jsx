import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { doctorsService } from '../services/doctorsService';
import { useDoctorAvailabilities } from '../../availabilities/hooks/useAvailabilities';

const DAYS = [
  { code: 'LUNES', label: 'Lunes' },
  { code: 'MARTES', label: 'Martes' },
  { code: 'MIERCOLES', label: 'Miércoles' },
  { code: 'JUEVES', label: 'Jueves' },
  { code: 'VIERNES', label: 'Viernes' },
  { code: 'SABADO', label: 'Sábado' },
  { code: 'DOMINGO', label: 'Domingo' },
];

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function normalizeDay(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

function buildSchedule(availabilities) {
  return DAYS.map((day) => {
    const ranges = availabilities
      .filter((item) => normalizeDay(item.day) === day.code)
      .map((item) => ({
        startTime: item.startTime?.slice(0, 5) || '',
        endTime: item.endTime?.slice(0, 5) || '',
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return {
      ...day,
      enabled: ranges.length > 0,
      ranges,
    };
  });
}

function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);

  return hours * 60 + minutes;
}

function validateSchedule(schedule) {
  const activeDays = schedule.filter((day) => day.enabled);

  if (activeDays.length === 0) {
    return 'Debés configurar al menos un día de atención.';
  }

  for (const day of activeDays) {
    if (day.ranges.length === 0) {
      return `Agregá un horario para el día ${day.label}.`;
    }

    const orderedRanges = [];

    for (const range of day.ranges) {
      if (
        !TIME_PATTERN.test(range.startTime) ||
        !TIME_PATTERN.test(range.endTime)
      ) {
        return `Completá correctamente los horarios de ${day.label}.`;
      }

      const start = toMinutes(range.startTime);
      const end = toMinutes(range.endTime);
      const duration = end - start;

      if (duration <= 0) {
        return `En ${day.label}, la hora de salida debe ser posterior a la entrada.`;
      }

      if (duration < 30 || duration % 30 !== 0) {
        return `En ${day.label}, cada franja debe tener una duración múltiplo de 30 minutos.`;
      }

      orderedRanges.push({ start, end });
    }

    orderedRanges.sort((a, b) => a.start - b.start);

    for (let i = 1; i < orderedRanges.length; i += 1) {
      if (orderedRanges[i].start < orderedRanges[i - 1].end) {
        return `Los horarios de ${day.label} se superponen.`;
      }
    }
  }

  return '';
}

function AvailabilityEditor({
  doctorId,
  initialAvailabilities,
  saving,
  onSave,
  onEdited,
}) {
  const [schedule, setSchedule] = useState(() =>
    buildSchedule(initialAvailabilities)
  );
  const [validationError, setValidationError] = useState('');

  const updateDay = (dayCode, updater) => {
    setSchedule((current) =>
      current.map((day) => (day.code === dayCode ? updater(day) : day))
    );
    setValidationError('');
    onEdited();
  };

  const toggleDay = (dayCode, enabled) => {
    updateDay(dayCode, (day) => ({
      ...day,
      enabled,
      ranges:
        enabled && day.ranges.length === 0
          ? [{ startTime: '08:00', endTime: '12:00' }]
          : day.ranges,
    }));
  };

  const updateTime = (dayCode, index, field, value) => {
    updateDay(dayCode, (day) => ({
      ...day,
      ranges: day.ranges.map((range, rangeIndex) =>
        rangeIndex === index ? { ...range, [field]: value } : range
      ),
    }));
  };

  const addRange = (dayCode) => {
    updateDay(dayCode, (day) => ({
      ...day,
      ranges: [...day.ranges, { startTime: '', endTime: '' }],
    }));
  };

  const removeRange = (dayCode, index) => {
    updateDay(dayCode, (day) => ({
      ...day,
      ranges: day.ranges.filter((_, rangeIndex) => rangeIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = validateSchedule(schedule);

    if (message) {
      setValidationError(message);

      return;
    }

    const days = schedule
      .filter((day) => day.enabled)
      .flatMap((day) =>
        day.ranges.map((range) => ({
          day: day.code,
          startTime: range.startTime,
          endTime: range.endTime,
        }))
      );

    await onSave({ doctorId, days });
  };

  const resetForm = () => {
    setSchedule(buildSchedule(initialAvailabilities));
    setValidationError('');
    onEdited();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                    toggleDay(day.code, event.target.checked)
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
                              updateTime(
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
                              updateTime(
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
                            onClick={() => removeRange(day.code, index)}
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
                        onClick={() => addRange(day.code)}
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

      {validationError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {validationError}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={resetForm}
        >
          Descartar cambios
        </Button>

        <Button type="submit" disabled={saving} className="disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar disponibilidad'}
        </Button>
      </div>
    </form>
  );
}

function DoctorAvailabilityPage() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [doctorError, setDoctorError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    availabilities,
    loading,
    error,
    fieldErrors,
    refetch,
    saveAvailabilities,
  } = useDoctorAvailabilities(id);

  useEffect(() => {
    let active = true;

    const loadDoctor = async () => {
      try {
        const doctors = await doctorsService.getAllForSelect();

        if (active) {
          const selected = doctors.find((item) => item.id === id);

          setDoctor(selected || null);
          setDoctorError(
            selected ? '' : 'No se encontró el médico seleccionado.'
          );
        }
      } catch {
        if (active) {
          setDoctorError('No se pudo consultar la información del médico.');
        }
      }
    };

    loadDoctor();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (payload) => {
    setSaving(true);
    setSuccessMessage('');

    const isUpdate = availabilities.length > 0;
    const result = await saveAvailabilities(payload, isUpdate);

    if (result.ok) {
      setSuccessMessage('La disponibilidad se guardó correctamente.');
    }

    setSaving(false);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <nav className="text-sm text-med-text-sub">
        <Link to="/admin/doctors" className="hover:text-med-primary-900">
          Doctores
        </Link>
        <span> › Disponibilidad horaria</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-med-primary-900 sm:text-3xl">
          Disponibilidad Horaria
        </h1>

        <p className="mt-1 text-sm text-med-text-sub">
          Administrá los días y horarios de atención del profesional.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-med-primary-900">
          {doctor?.name || 'Profesional seleccionado'}
        </h2>

        <p className="mt-1 text-sm text-med-text-sub">
          {doctor?.specialty?.name || 'Especialidad no disponible'}
        </p>

        {doctorError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {doctorError}
          </p>
        )}
      </Card>

      <div className="rounded-xl border border-med-primary-200 bg-med-primary-50 p-4">
        <p className="text-sm text-med-primary-900">
          Los horarios se configuran para el mes actual, en bloques de 30
          minutos. Al actualizar, las reservas existentes se conservan. Los
          feriados y horarios pasados no se ofrecen para reservar.
        </p>
      </div>

      {successMessage && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {successMessage}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>

          {Object.entries(fieldErrors).map(([field, message]) => (
            <p key={field} className="mt-1">
              {field}: {message}
            </p>
          ))}
        </div>
      )}

      {loading ? (
        <Card>
          <p className="text-sm text-med-text-sub">
            {saving
              ? 'Actualizando disponibilidades...'
              : 'Cargando horarios configurados...'}
          </p>
        </Card>
      ) : error && !saving ? (
        <Button variant="outline" onClick={refetch}>
          Reintentar consulta
        </Button>
      ) : (
        <AvailabilityEditor
          doctorId={id}
          initialAvailabilities={availabilities}
          saving={saving}
          onSave={handleSave}
          onEdited={() => setSuccessMessage('')}
        />
      )}
    </div>
  );
}

export default DoctorAvailabilityPage;
