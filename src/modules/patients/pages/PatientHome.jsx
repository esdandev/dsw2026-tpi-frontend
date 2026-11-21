import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import useAuth from '../../auth/hook/useAuth';
import { specialtiesService } from '../../specialties/services/specialtiesService';
import { doctorsService } from '../../doctors/services/doctorsService';
import { useDoctorSlots } from '../../availabilities/hooks/useAvailabilities';
import { usePatientAppointments } from '../../appointments/hooks/useAppointments';
import {
  ARGENTINA_TIMEZONE,
  formatDateAR,
  formatTimeAR,
  toApiDateFilter,
} from '../../shared/helpers/dateArgentina';
import SlotSelector from '../components/SlotSelector';

function getCurrentMondayAR() {
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
  const mondayUtc = new Date(Date.UTC(y, m - 1, d + diff, 12, 0, 0));

  return toApiDateFilter(mondayUtc);
}

function addDays(yyyyMmDd, days) {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));

  return toApiDateFilter(utc);
}

function getDoctorName(doc) {
  if (!doc) return '';

  return (
    doc.fullName ||
    doc.name ||
    [doc.firstName, doc.lastName].filter(Boolean).join(' ') ||
    [doc.user?.firstName, doc.user?.lastName].filter(Boolean).join(' ') ||
    `Médico #${doc.id}`
  );
}
function getDoctorInitials(fullName) {
  const clean = fullName.replace(/^dra?\.\s*/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return clean.slice(0, 2).toUpperCase() || 'DR';
}

function PatientHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const patientDni = user?.dni ||
    localStorage.getItem('dni') ||
    '';
  const {
    bookAppointment,
    error: bookingError,
    fieldErrors,
  } = usePatientAppointments(patientDni);

  // 1. Especialidades y médicos reales
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  // 2. Navegación semanal (máx. 31 días desde hoy)
  const baseMonday = useMemo(() => getCurrentMondayAR(), []);
  const [weekOffset, setWeekOffset] = useState(0);
  const weekStart = useMemo(
    () => addDays(baseMonday, weekOffset * 7),
    [baseMonday, weekOffset]
  );
  const weekEnd = useMemo(() => addDays(weekStart, 4), [weekStart]);

  // 3. Slot seleccionado, motivo y estado de reserva
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar especialidades al iniciar
  useEffect(() => {
    let active = true;

    async function loadSpecialties() {
      setLoadingSpecialties(true);
      try {
        const list = await specialtiesService.getAllForSelect();

        if (!active) return;

        setSpecialties(list);

        if (list.length > 0) {
          setSelectedSpecialtyId(String(list[0].id));
        }
      } catch {
        if (active) setSpecialties([]);
      } finally {
        if (active) setLoadingSpecialties(false);
      }
    }

    loadSpecialties();

    return () => {
      active = false;
    };
  }, []);

  // Cargar médicos al cambiar especialidad
  useEffect(() => {
    let active = true;

    async function loadDoctors() {
      if (!selectedSpecialtyId) {
        setDoctors([]);
        setSelectedDoctorId('');

        return;
      }

      setLoadingDoctors(true);
      setSelectedDoctorId('');
      setSelectedSlot(null);

      try {
        const list = await doctorsService.getAllForSelect({
          specialtyId: selectedSpecialtyId,
        });

        if (!active) return;

        const filtered = list.filter(
          (doc) =>
            String(doc.specialtyId ?? doc.specialty?.id ?? '') ===
            String(selectedSpecialtyId)
        );

        setDoctors(filtered);

        if (filtered.length > 0) {
          setSelectedDoctorId(String(filtered[0].id));
        }
      } catch {
        if (active) setDoctors([]);
      } finally {
        if (active) setLoadingDoctors(false);
      }
    }

    loadDoctors();

    return () => {
      active = false;
    };
  }, [selectedSpecialtyId]);

  // Cargar slots reales de la semana
  const {
    slots,
    loading: loadingSlots,
    error: slotsError,
    refetch: refetchSlots,
  } = useDoctorSlots({
    doctorId: selectedDoctorId,
    from: weekStart,
    to: weekEnd,
  });

  const selectedDoctor = doctors.find(
    (doc) => String(doc.id) === String(selectedDoctorId)
  );

   const selectedSlotStart =
    selectedSlot?.startTime ||
    selectedSlot?.startAt ||
    selectedSlot?.dateTime ||
    selectedSlot?.start;

const selectedSlotDateLabel = selectedSlot?.date
  ? formatDateAR(selectedSlot.date)
  : formatDateAR(selectedSlotStart);

const selectedSlotTimeLabel =
  typeof selectedSlot?.startTime === 'string' &&
  /^\d{2}:\d{2}/.test(selectedSlot.startTime)
    ? selectedSlot.startTime.slice(0, 5)
    : formatTimeAR(selectedSlotStart);


 

  const handleConfirmAppointment = async () => {
    setLocalError('');
    setSuccessMessage('');

    if (!selectedDoctorId || !selectedSlot) {
      setLocalError('Seleccioná un profesional y un horario disponible.');

      return;
    }
    const cleanDni = String(patientDni).replace(/\D/g, '');
     if (cleanDni.length < 7 || cleanDni.length > 10) {
     setLocalError('Tu sesión no tiene un DNI de paciente válido (7 a 10 dígitos). Iniciá sesión como paciente.');
     return;
    }
    const trimmedReason = reason.trim();

    if (trimmedReason.length < 5) {
      setReasonError('El motivo de consulta debe tener al menos 5 caracteres.');

      return;
    }

    setReasonError('');
    setSubmitting(true);

    const availabilitySlotId =
      selectedSlot.availabilitySlotId ?? selectedSlot.id;

    const res = await bookAppointment({
      doctorId: selectedDoctorId,
      availabilitySlotId,
      patientDni,
      reason: trimmedReason,
    });

    setSubmitting(false);

    if (res.ok) {
      setSuccessMessage('Turno reservado correctamente.');
      setSelectedSlot(null);
      setReason('');
      await refetchSlots();
    } else {
      // Ante 409 (APPOINTMENT_CONFLICT / DOCTOR_INACTIVE) limpiar slot y recargar
      setSelectedSlot(null);
      await refetchSlots();
    }
  };

  const displayError = localError || bookingError;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* 1. Selector de Especialidad y Médico */}
      <Card className="p-6 sm:p-7">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-primary-900">
            Reservar Turno Médico
          </h1>
          <p className="text-xs sm:text-sm text-med-text-sub mt-1">
            Seleccione la especialidad, el profesional y un horario disponible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-main">
              Especialidad Médica
            </label>
            <select
              value={selectedSpecialtyId}
              disabled={loadingSpecialties}
              onChange={(e) => {
                setSelectedSpecialtyId(e.target.value);
                setSuccessMessage('');
                setLocalError('');
              }}
              className="w-full rounded-lg border border-med-border bg-white px-3 py-2.5 text-sm text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            >
              {loadingSpecialties && <option value="">Cargando...</option>}
              {!loadingSpecialties && specialties.length === 0 && (
                <option value="">No hay especialidades disponibles</option>
              )}
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-main">
              Profesional
            </label>
            <select
              value={selectedDoctorId}
              disabled={loadingDoctors || doctors.length === 0}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedSlot(null);
                setSuccessMessage('');
                setLocalError('');
              }}
              className="w-full rounded-lg border border-med-border bg-white px-3 py-2.5 text-sm text-med-text-main focus:outline-none focus:ring-1 focus:ring-med-primary-600"
            >
              {loadingDoctors && <option value="">Cargando médicos...</option>}
              {!loadingDoctors && doctors.length === 0 && (
                <option value="">Sin médicos para esta especialidad</option>
              )}
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  
                    {getDoctorName(doc)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedDoctor && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-med-border bg-med-primary-50/40 p-3.5">
            <div className="w-10 h-10 rounded-full bg-med-primary-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
             {getDoctorInitials(getDoctorName(selectedDoctor))}
            </div>
            <div>
              <p className="text-sm font-bold text-med-primary-900">
                
                  {getDoctorName(selectedDoctor)}
              </p>
              <p className="text-xs text-med-text-sub">
                {selectedDoctor.specialty?.name ||
                  specialties.find(
                    (s) => String(s.id) === String(selectedSpecialtyId)
                  )?.name}
                {selectedDoctor.licenseNumber
                  ? ` · Matrícula ${selectedDoctor.licenseNumber}`
                  : ''}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* 2. Calendario Semanal (Lun-Vie) */}
      <Card className="p-6 sm:p-7">
        {selectedDoctorId ? (
          <SlotSelector
            weekStart={weekStart}
            canGoPrev={weekOffset > 0}
            canGoNext={weekOffset < 3}
            onPrevWeek={() => {
              setWeekOffset((w) => Math.max(0, w - 1));
              setSelectedSlot(null);
            }}
            onNextWeek={() => {
              setWeekOffset((w) => Math.min(3, w + 1));
              setSelectedSlot(null);
            }}
            slots={slots}
            loading={loadingSlots}
            error={slotsError}
            onRetry={refetchSlots}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => {
              setSelectedSlot(slot);
              setLocalError('');
              setSuccessMessage('');
            }}
          />
        ) : (
          <p className="text-sm text-med-text-sub text-center py-6">
            Seleccioná una especialidad y un médico para ver los horarios
            disponibles.
          </p>
        )}
      </Card>

      {/* 3. Motivo de consulta y Barra de Resumen */}
      <Card className="p-6 sm:p-7 flex flex-col gap-4">
        {displayError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {displayError} — Elegí otro horario disponible.
          </div>
        )}

        {successMessage && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
            <span>{successMessage}</span>
            <Button
              type="button"
              onClick={() => navigate('/appointments')}
              className="bg-med-primary-900 text-white text-xs"
            >
              Ver Mis Turnos
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-med-text-main">
            Motivo de consulta
          </label>
          <textarea
            rows={3}
            placeholder="Describa brevemente el motivo de su consulta (mínimo 5 caracteres)..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);

              if (reasonError) setReasonError('');
            }}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 ${
              reasonError || fieldErrors?.reason
                ? 'border-red-500 focus:ring-red-500'
                : 'border-med-border focus:ring-med-primary-600'
            }`}
          />
          {(reasonError || fieldErrors?.reason) && (
            <span className="text-xs text-red-600">
              {reasonError || fieldErrors.reason}
            </span>
          )}
        </div>

        {/* Barra de resumen y botón Confirmar Turno */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-med-border">
          <div className="text-xs sm:text-sm text-med-text-sub">
            {selectedSlot && selectedSlotStart ? (
              <span>
                Turno seleccionado:{' '}
                <strong className="text-med-primary-900">
                  {selectedSlotDateLabel}
                </strong>{' '}
                a las{' '}
                <strong className="text-med-primary-900">
                  {selectedSlotTimeLabel} hs
                </strong>
              </span>
            ) : (
              <span>Ningún horario seleccionado todavía.</span>
            )}
          </div>

          <Button
            type="button"
            disabled={!selectedSlot || submitting}
            onClick={handleConfirmAppointment}
            className="bg-med-primary-900 hover:bg-med-primary-800 text-white disabled:opacity-50"
          >
            {submitting ? 'Confirmando...' : 'Confirmar Turno'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default PatientHome;
