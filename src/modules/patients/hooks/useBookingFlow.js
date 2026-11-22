import { formatDateAR } from '../../shared/helpers/dateArgentina';
import {
  getSlotDateKey,
  getSlotStart,
  getSlotTimeLabel,
} from '../../availabilities/helpers/slot';
import { getDoctorName } from '../../doctors/helpers/doctor';
import { useBookingSubmit } from './useBookingSubmit';
import { useDoctorCatalog } from './useDoctorCatalog';
import { useWeeklyCalendar } from './useWeeklyCalendar';

export function useBookingFlow(patientDni) {
  const catalog = useDoctorCatalog();
  const booking = useBookingSubmit(patientDni);
  const calendar = useWeeklyCalendar({ doctorId: catalog.selectedDoctorId });

  const selectedSlotStart = getSlotStart(booking.selectedSlot);

  // Todo lo que necesita el resumen viaja junto: el que dibuja no recalcula nada.
  const slotSummary =
    booking.selectedSlot && selectedSlotStart
      ? {
          start: selectedSlotStart,
          dateLabel: formatDateAR(getSlotDateKey(booking.selectedSlot)),
          timeLabel: getSlotTimeLabel(booking.selectedSlot),
          specialtyLabel:
            catalog.selectedDoctor?.specialty?.name ||
            catalog.specialties.find(
              (specialty) =>
                String(specialty.id) === String(catalog.selectedSpecialtyId)
            )?.name ||
            '',
          doctorLabel: getDoctorName(catalog.selectedDoctor),
        }
      : null;

  function selectSpecialty(specialtyId) {
    if (String(specialtyId) !== String(catalog.selectedSpecialtyId)) {
      catalog.setSelectedDoctorId('');
      booking.resetSelection();
    }

    catalog.setSelectedSpecialtyId(specialtyId);
    booking.resetMessages();
  }

  function selectDoctor(doctorId) {
    catalog.setSelectedDoctorId(doctorId);
    booking.resetSelection();
  }

  function goPrevWeek() {
    calendar.goPrevWeek();
    booking.resetSlot();
  }

  function goNextWeek() {
    calendar.goNextWeek();
    booking.resetSlot();
  }

  function confirmAppointment() {
    return booking.confirmAppointment({
      doctorId: catalog.selectedDoctorId,
      onBooked: calendar.refetchSlots,
    });
  }

  return {
    specialties: catalog.specialties,
    loadingSpecialties: catalog.loadingSpecialties,
    selectedSpecialtyId: catalog.selectedSpecialtyId,
    selectSpecialty,
    doctors: catalog.doctors,
    loadingDoctors: catalog.loadingDoctors,
    selectedDoctorId: catalog.selectedDoctorId,
    selectDoctor,
    selectedDoctor: catalog.selectedDoctor,
    weekStart: calendar.weekStart,
    canGoPrev: calendar.canGoPrev,
    canGoNext: calendar.canGoNext,
    goPrevWeek,
    goNextWeek,
    slots: calendar.slots,
    loadingSlots: calendar.loadingSlots,
    slotsError: calendar.slotsError,
    refetchSlots: calendar.refetchSlots,
    selectedSlot: booking.selectedSlot,
    selectSlot: booking.selectSlot,
    slotSummary,
    reason: booking.reason,
    setReason: booking.setReason,
    reasonError: booking.reasonError,
    clearReasonError: booking.clearReasonError,
    submitting: booking.submitting,
    displayError: booking.displayError,
    loadError: catalog.loadError,
    retryLoad: catalog.retryLoad,
    fieldErrors: booking.fieldErrors,
    successMessage: booking.successMessage,
    confirmAppointment,
  };
}
