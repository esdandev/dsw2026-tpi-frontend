import { useEffect, useMemo, useRef, useState } from 'react';
import { specialtiesService } from '../../specialties/services/specialtiesService';
import { doctorsService } from '../../doctors/services/doctorsService';
import { parseBackendError } from '../../shared/helpers/backendError';
import { useDoctorSlots } from '../../availabilities/hooks/useAvailabilities';
import { usePatientAppointments } from '../../appointments/hooks/useAppointments';
import {
  addDays,
  formatDateAR,
  getCurrentMondayAR,
} from '../../shared/helpers/dateArgentina';
import {
  getSlotDateKey,
  getSlotStart,
  getSlotTimeLabel,
} from '../../availabilities/helpers/slot';
import { getDoctorName } from '../../doctors/helpers/doctor';

const MAX_WEEK_OFFSET = 3;

export function useBookingFlow(patientDni) {
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
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const lastSpecialtyRef = useRef('');

  // Cargar especialidades al iniciar (y al reintentar)
  useEffect(() => {
    let active = true;

    async function loadSpecialties() {
      setLoadingSpecialties(true);
      setLoadError('');
      try {
        const list = await specialtiesService.getAllForSelect();

        if (!active) return;

        setSpecialties(list);

        if (list.length > 0) {
          // Al reintentar no pisamos la especialidad que el paciente ya eligió.
          setSelectedSpecialtyId((current) => current || String(list[0].id));
        }
      } catch (err) {
        if (active) {
          setSpecialties([]);
          setLoadError(
            parseBackendError(err).message ||
              'No se pudieron cargar las especialidades.'
          );
        }
      } finally {
        if (active) setLoadingSpecialties(false);
      }
    }

    loadSpecialties();

    return () => {
      active = false;
    };
  }, [reloadToken]);

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
      setLoadError('');

      // Solo se limpia la selección cuando cambió la especialidad, no al reintentar.
      if (lastSpecialtyRef.current !== selectedSpecialtyId) {
        lastSpecialtyRef.current = selectedSpecialtyId;
        setSelectedDoctorId('');
        setSelectedSlot(null);
      }

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

        // Conserva el m�dico elegido si sigue existiendo en la especialidad.
        setSelectedDoctorId((current) =>
          filtered.some((doc) => String(doc.id) === current)
            ? current
            : filtered.length > 0
              ? String(filtered[0].id)
              : ''
        );
      } catch (err) {
        if (active) {
          setDoctors([]);
          setLoadError(
            parseBackendError(err).message ||
              'No se pudieron cargar los profesionales.'
          );
        }
      } finally {
        if (active) setLoadingDoctors(false);
      }
    }

    loadDoctors();

    return () => {
      active = false;
    };
  }, [selectedSpecialtyId, reloadToken]);

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

  const selectedSlotStart = getSlotStart(selectedSlot);
  const selectedSlotDateLabel = formatDateAR(getSlotDateKey(selectedSlot));
  const selectedSlotTimeLabel = getSlotTimeLabel(selectedSlot);

  // Todo lo que necesita el resumen viaja junto: el que dibuja no recalcula nada.
  const slotSummary =
    selectedSlot && selectedSlotStart
      ? {
          start: selectedSlotStart,
          dateLabel: selectedSlotDateLabel,
          timeLabel: selectedSlotTimeLabel,
          specialtyLabel:
            selectedDoctor?.specialty?.name ||
            specialties.find(
              (specialty) =>
                String(specialty.id) === String(selectedSpecialtyId)
            )?.name ||
            '',
          doctorLabel: getDoctorName(selectedDoctor),
        }
      : null;

  function selectSpecialty(specialtyId) {
    setSelectedSpecialtyId(specialtyId);
    setSuccessMessage('');
    setLocalError('');
  }

  function selectDoctor(doctorId) {
    setSelectedDoctorId(doctorId);
    setSelectedSlot(null);
    setSuccessMessage('');
    setLocalError('');
  }

  function selectSlot(slot) {
    setSelectedSlot(slot);
    setLocalError('');
    setSuccessMessage('');
  }

  function goPrevWeek() {
    setWeekOffset((w) => Math.max(0, w - 1));
    setSelectedSlot(null);
  }

  function goNextWeek() {
    setWeekOffset((w) => Math.min(MAX_WEEK_OFFSET, w + 1));
    setSelectedSlot(null);
  }

  async function confirmAppointment() {
    setLocalError('');
    setSuccessMessage('');

    if (!selectedDoctorId || !selectedSlot) {
      setLocalError('Seleccioná un profesional y un horario disponible.');

      return;
    }

    const cleanDni = String(patientDni).replace(/\D/g, '');

    if (cleanDni.length < 7 || cleanDni.length > 10) {
      setLocalError(
        'Tu sesión no tiene un DNI de paciente válido (7 a 10 dígitos). Iniciá sesión como paciente.'
      );

      return;
    }

    const trimmedReason = reason.trim();

    if (trimmedReason.length < 5 || trimmedReason.length > 300) {
      setReasonError(
        'El motivo de consulta debe tener entre 5 y 300 caracteres.'
      );

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
      setSelectedSlot(null);
      await refetchSlots();
    }
  }

  return {
    specialties,
    loadingSpecialties,
    selectedSpecialtyId,
    selectSpecialty,
    doctors,
    loadingDoctors,
    selectedDoctorId,
    selectDoctor,
    selectedDoctor,
    weekStart,
    canGoPrev: weekOffset > 0,
    canGoNext: weekOffset < MAX_WEEK_OFFSET,
    goPrevWeek,
    goNextWeek,
    slots,
    loadingSlots,
    slotsError,
    refetchSlots,
    selectedSlot,
    selectSlot,
    slotSummary,
    reason,
    setReason,
    reasonError,
    clearReasonError: () => setReasonError(''),
    submitting,
    displayError: localError || bookingError,
    loadError,
    retryLoad: () => setReloadToken((token) => token + 1),
    fieldErrors,
    successMessage,
    confirmAppointment,
  };
}
