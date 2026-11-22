import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/components/Button';
import AvailabilityTable from './AvailabilityTable';

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

      if (start % 30 !== 0 || end % 30 !== 0 || duration < 30) {
        return `En ${day.label}, usá horarios cada 30 minutos (por ejemplo 08:00 u 08:30).`;
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

function AvailabilityForm({
  doctorId,
  initialAvailabilities,
  saving,
  onSave,
  onEdited,
}) {
  const navigate = useNavigate();
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
      <AvailabilityTable
        schedule={schedule}
        saving={saving}
        onToggleDay={toggleDay}
        onUpdateTime={updateTime}
        onAddRange={addRange}
        onRemoveRange={removeRange}
      />

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
          variant="secondary"
          onClick={() => navigate('/admin/doctors')}
        >
          Cancelar
        </Button>

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

export default AvailabilityForm;
