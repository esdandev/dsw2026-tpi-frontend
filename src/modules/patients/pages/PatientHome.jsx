import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import {
  createPatientAppointment,
  getBookingDoctors,
  getBookingSpecialties,
  getDoctorSlots,
} from '../services/patientAppointments';

// Convertir una fecha al formato YYYY-MM-DD
function formatDateKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Obtener los próximos siete días
function getNextSevenDays(weekOffset) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type) =>
    Number(parts.find((part) => part.type === type).value);
  const firstDay = new Date(
    Date.UTC(
      value('year'),
      value('month') - 1,
      value('day') + weekOffset * 7,
      12
    )
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(firstDay);

    date.setUTCDate(firstDay.getUTCDate() + index);

    return {
      key: formatDateKey(date),
      number: date.getUTCDate(),
      weekday: new Intl.DateTimeFormat('es-AR', {
        weekday: 'short',
        timeZone: 'UTC',
      })
        .format(date)
        .replace('.', '')
        .toUpperCase(),
      month: new Intl.DateTimeFormat('es-AR', {
        month: 'short',
        timeZone: 'UTC',
      })
        .format(date)
        .toUpperCase(),
      label: new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'full',
        timeZone: 'UTC',
      }).format(date),
    };
  });
}

function PatientHome() {
  const navigate = useNavigate();

  // Datos reales del paciente autenticado
  const { email, dni } = useAuth();

  // Especialidades y médicos
  const [specialties, setSpecialties] = useState([]);
  const [specialtyId, setSpecialtyId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');

  // Disponibilidad y reserva
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [reason, setReason] = useState('');

  // Estados de carga
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Errores y confirmación
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [slotsReloadCount, setSlotsReloadCount] = useState(0);

  // Datos derivados de la selección
  const weekDays = getNextSevenDays(weekOffset);
  const fromDate = weekDays[0].key;
  const toDate = weekDays[weekDays.length - 1].key;

  const currentDoctor = doctors.find((doctor) => doctor.id === doctorId);
  const currentSpecialty = specialties.find((item) => item.id === specialtyId);
  const selectedSlot = slots.find((slot) => slot.id === slotId);
  const selectedDay = weekDays.find((day) => day.key === selectedSlot?.date);

  // Cargar especialidades al abrir la pantalla
  useEffect(() => {
    let active = true;

    const loadSpecialties = async () => {
      try {
        const data = await getBookingSpecialties();

        if (active) {
          setSpecialties(data);
        }
      } catch {
        if (active) {
          setErrorMessage('No se pudieron cargar las especialidades.');
        }
      } finally {
        if (active) {
          setLoadingSpecialties(false);
        }
      }
    };

    loadSpecialties();

    return () => {
      active = false;
    };
  }, []);

  // Cargar médicos cuando cambia la especialidad
  useEffect(() => {
    let active = true;

    const loadDoctors = async () => {
      if (!specialtyId) {
        return;
      }

      setLoadingDoctors(true);

      try {
        const data = await getBookingDoctors(specialtyId);

        if (active) {
          setDoctors(data);
        }
      } catch {
        if (active) {
          setErrorMessage('No se pudieron cargar los médicos.');
        }
      } finally {
        if (active) {
          setLoadingDoctors(false);
        }
      }
    };

    loadDoctors();

    return () => {
      active = false;
    };
  }, [specialtyId]);

  // Cargar horarios reales del médico
  useEffect(() => {
    let active = true;

    const loadSlots = async () => {
      if (!doctorId) {
        return;
      }

      setLoadingSlots(true);

      try {
        const data = await getDoctorSlots(doctorId, fromDate, toDate);

        if (active) {
          setSlots(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.status === 404
              ? 'El médico seleccionado ya no está disponible.'
              : 'No se pudieron consultar los horarios disponibles.'
          );
        }
      } finally {
        if (active) {
          setLoadingSlots(false);
        }
      }
    };

    loadSlots();

    return () => {
      active = false;
    };
  }, [doctorId, fromDate, toDate, slotsReloadCount]);

  // Cambiar especialidad
  const handleSpecialtyChange = (event) => {
    setSpecialtyId(event.target.value);
    setDoctorId('');
    setDoctors([]);
    setSlots([]);
    setSlotId('');
    setWeekOffset(0);
    setErrorMessage('');
  };

  // Cambiar médico
  const handleDoctorChange = (event) => {
    setDoctorId(event.target.value);
    setSlots([]);
    setSlotId('');
    setWeekOffset(0);
    setErrorMessage('');
  };

  // Navegar entre semanas
  const changeWeek = (amount) => {
    setWeekOffset((current) => Math.max(0, current + amount));
    setSlotId('');
    setSlots([]);
    setErrorMessage('');
  };

  // Confirmar la reserva contra el backend
  const handleConfirmAppointment = async () => {
    if (!doctorId || !selectedSlot || !dni) {
      setErrorMessage(
        'Seleccioná un médico y un horario, e iniciá sesión nuevamente si falta tu DNI.'
      );

      return;
    }

    const cleanReason = reason.trim();

    if (cleanReason.length < 5 || cleanReason.length > 300) {
      setErrorMessage(
        'El motivo de consulta debe tener entre 5 y 300 caracteres.'
      );

      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const appointment = await createPatientAppointment({
        doctorId,
        availabilitySlotId: selectedSlot.id,
        dni,
        reason: cleanReason,
      });

      // Mostrar éxito solamente después de la respuesta del backend
      setConfirmedAppointment({
        id: appointment.id,
        doctorName: currentDoctor?.name || 'Médico',
        specialtyName: currentSpecialty?.name || 'Especialidad',
        date: selectedDay?.label || selectedSlot.date,
        time: selectedSlot.startTime,
      });

      setSlotId('');
      setReason('');
      setSlotsReloadCount((current) => current + 1);
    } catch (error) {
      const status = error.response?.status;

      if (status === 409) {
        setErrorMessage('Ese horario ya no está disponible. Elegí otro turno.');
        setSlotId('');
        setSlotsReloadCount((current) => current + 1);
      } else if (status === 404) {
        setErrorMessage('El médico o el horario seleccionado ya no existe.');
      } else if (status === 400) {
        setErrorMessage('Revisá los datos de la reserva.');
      } else if (status === 403) {
        setErrorMessage('Acceso denegado para reservar turnos.');
      } else if (status === 429) {
        setErrorMessage(
          'Demasiados intentos. Esperá un momento e intentá nuevamente.'
        );
      } else {
        setErrorMessage('No se pudo reservar el turno. Intentá nuevamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Selector de especialidad y médico */}
      <Card className="p-6 sm:p-7">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-primary-900">
            Reservar Turno Médico
          </h1>

          <p className="text-xs sm:text-sm text-med-text-sub mt-1">
            Seleccioná la especialidad, el profesional y un horario disponible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="booking-specialty"
              className="text-xs font-semibold text-med-text-sub"
            >
              Seleccionar Especialidad
            </label>

            <select
              id="booking-specialty"
              value={specialtyId}
              onChange={handleSpecialtyChange}
              disabled={loadingSpecialties}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg"
            >
              <option value="">
                {loadingSpecialties ? 'Cargando...' : 'Elegí una especialidad'}
              </option>

              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="booking-doctor"
              className="text-xs font-semibold text-med-text-sub"
            >
              Seleccionar Doctor
            </label>

            <select
              id="booking-doctor"
              value={doctorId}
              onChange={handleDoctorChange}
              disabled={!specialtyId || loadingDoctors}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg"
            >
              <option value="">
                {loadingDoctors ? 'Cargando médicos...' : 'Elegí un médico'}
              </option>

              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Errores */}
      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}

      {/* Información del médico */}
      <Card className="p-5 sm:p-6 border-med-border">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-med-primary-100 flex items-center justify-center text-2xl text-med-primary-900">
            👨‍⚕️
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-med-primary-900">
              {currentDoctor?.name || 'Seleccioná un médico'}
            </h2>

            <p className="text-xs sm:text-sm text-med-text-sub">
              {currentDoctor?.specialty?.name ||
                currentSpecialty?.name ||
                'Especialidad médica'}
            </p>
          </div>
        </div>
      </Card>

      {/* Calendario de horarios */}
      <Card className="p-5 sm:p-6 border-med-border">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-med-border-subtle">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-med-primary-900">
              Horarios disponibles
            </h2>

            <p className="text-xs text-med-text-sub mt-1">
              {weekDays[0].label} – {weekDays[6].label}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!doctorId || weekOffset === 0}
              onClick={() => changeWeek(-1)}
            >
              ‹
            </Button>

            <Button
              variant="outline"
              disabled={!doctorId}
              onClick={() => changeWeek(1)}
            >
              ›
            </Button>
          </div>
        </div>

        {!doctorId ? (
          <p className="py-8 text-center text-sm text-med-text-sub">
            Seleccioná un médico para ver los horarios.
          </p>
        ) : loadingSlots ? (
          <p className="py-8 text-center text-sm text-med-text-sub">
            Cargando horarios disponibles...
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-5">
            {weekDays.map((day) => {
              const daySlots = slots.filter((slot) => slot.date === day.key);

              return (
                <div key={day.key} className="flex flex-col items-center gap-3">
                  <div className="text-center">
                    <span className="text-[11px] font-bold text-med-text-sub uppercase">
                      {day.weekday}
                    </span>

                    <p className="text-xl font-bold text-med-primary-900">
                      {day.number}
                    </p>

                    <span className="text-[10px] text-med-text-muted">
                      {day.month}
                    </span>
                  </div>

                  <div className="w-full flex flex-col gap-2">
                    {daySlots.length > 0 ? (
                      daySlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSlotId(slot.id)}
                          className={`w-full py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                            slotId === slot.id
                              ? 'bg-emerald-400 text-white border-emerald-400'
                              : 'bg-white border-med-border text-med-primary-900 hover:bg-med-primary-50'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))
                    ) : (
                      <span className="text-center text-xs text-med-text-muted">
                        Sin horarios
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Resumen de selección */}
      <div className="bg-med-primary-50 border border-med-primary-200/60 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
        <div className="border-l-4 border-med-primary-900 pl-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-med-text-sub">
            Resumen de selección
          </span>

          <p className="text-base sm:text-lg font-bold text-med-primary-900 mt-1">
            {selectedSlot && selectedDay
              ? `${selectedDay.label}, ${selectedSlot.startTime} hs`
              : 'Seleccioná un horario disponible'}
          </p>

          <p className="text-xs text-med-text-sub mt-1">
            {currentDoctor?.name || 'Médico no seleccionado'} · Duración: 30 min
          </p>
        </div>

        {/* Motivo de consulta */}
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
            maxLength={300}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Describí brevemente el motivo del turno"
            className="w-full rounded-lg border border-med-border bg-white px-3 py-2.5 text-sm"
          />

          <p className="text-xs text-med-text-sub">Entre 5 y 300 caracteres.</p>
        </div>

        {/* Confirmación */}
        <Button
          type="button"
          onClick={handleConfirmAppointment}
          disabled={submitting || !selectedSlot}
          className="self-end px-6 py-3"
        >
          {submitting ? 'Confirmando...' : 'Confirmar Turno'}
        </Button>
      </div>

      {/* Modal de reserva confirmada */}
      {confirmedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>

            <h3 className="text-xl font-bold text-med-primary-900">
              ¡Turno confirmado con éxito!
            </h3>

            <p className="text-xs text-med-text-sub mt-2">
              El backend confirmó tu reserva con{' '}
              {confirmedAppointment.doctorName}.
            </p>

            <div className="mt-5 p-3.5 bg-med-primary-50 border border-med-primary-200/60 rounded-xl text-xs text-med-primary-900 text-left space-y-2">
              <p>
                <strong>Especialidad:</strong>{' '}
                {confirmedAppointment.specialtyName}
              </p>

              <p>
                <strong>Fecha:</strong> {confirmedAppointment.date}
              </p>

              <p>
                <strong>Horario:</strong> {confirmedAppointment.time} hs
              </p>

              <p>
                <strong>Paciente:</strong> {email || 'Paciente'} (DNI: {dni})
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                className="w-full text-xs py-2.5"
                onClick={() => navigate('/appointments')}
              >
                Ver Mis Turnos
              </Button>

              <Button
                variant="secondary"
                className="w-full text-xs py-2.5"
                onClick={() => setConfirmedAppointment(null)}
              >
                Reservar Otro
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientHome;
