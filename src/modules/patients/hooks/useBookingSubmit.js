import { useState } from 'react';
import { usePatientAppointments } from '../../appointments/hooks/useAppointments';

export function useBookingSubmit(patientDni) {
  const {
    bookAppointment,
    error: bookingError,
    fieldErrors,
  } = usePatientAppointments(patientDni);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetSlot = () => setSelectedSlot(null);

  const resetMessages = () => {
    setLocalError('');
    setSuccessMessage('');
  };

  const resetSelection = () => {
    setSelectedSlot(null);
    resetMessages();
  };

  const clearReasonError = () => setReasonError('');

  function selectSlot(slot) {
    setSelectedSlot(slot);
    resetMessages();
  }

  async function confirmAppointment({ doctorId, onBooked }) {
    setLocalError('');
    setSuccessMessage('');

    if (!doctorId || !selectedSlot) {
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
      doctorId,
      availabilitySlotId,
      patientDni,
      reason: trimmedReason,
    });

    setSubmitting(false);

    if (res.ok) {
      setSuccessMessage('Turno reservado correctamente.');
      setSelectedSlot(null);
      setReason('');
      await onBooked?.();
    } else {
      setSelectedSlot(null);
      await onBooked?.();
    }
  }

  return {
    selectedSlot,
    selectSlot,
    reason,
    setReason,
    reasonError,
    clearReasonError,
    submitting,
    displayError: localError || bookingError,
    fieldErrors,
    successMessage,
    resetSlot,
    resetMessages,
    resetSelection,
    confirmAppointment,
  };
}
