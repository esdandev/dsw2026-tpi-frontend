import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import useProfile from '../../auth/hook/useProfile';
import {
  SESSION_FIELDS,
  readSession,
} from '../../auth/services/sessionStorage';
import BookingConfirmCard from '../components/BookingConfirmCard';
import {
  getDoctorInitials,
  getDoctorName,
  useBookingFlow,
} from '../hooks/useBookingFlow';
import SlotSelector from '../components/SlotSelector';

function PatientHome() {
  const navigate = useNavigate();
  const { dni } = useProfile();
  const patientDni = dni || readSession(SESSION_FIELDS.DNI) || '';

  const {
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
    canGoPrev,
    canGoNext,
    goPrevWeek,
    goNextWeek,
    slots,
    loadingSlots,
    slotsError,
    refetchSlots,
    selectedSlot,
    selectSlot,
    selectedSlotStart,
    selectedSlotDateLabel,
    selectedSlotTimeLabel,
    reason,
    setReason,
    reasonError,
    clearReasonError,
    submitting,
    displayError,
    fieldErrors,
    successMessage,
    confirmAppointment,
  } = useBookingFlow(patientDni);

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
              onChange={(e) => selectSpecialty(e.target.value)}
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
              onChange={(e) => selectDoctor(e.target.value)}
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
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrevWeek={goPrevWeek}
            onNextWeek={goNextWeek}
            slots={slots}
            loading={loadingSlots}
            error={slotsError}
            onRetry={refetchSlots}
            selectedSlot={selectedSlot}
            onSelectSlot={selectSlot}
          />
        ) : (
          <p className="text-sm text-med-text-sub text-center py-6">
            Seleccioná una especialidad y un médico para ver los horarios
            disponibles.
          </p>
        )}
      </Card>

      {/* 3. Motivo de consulta y Barra de Resumen */}
      <BookingConfirmCard
        displayError={displayError}
        successMessage={successMessage}
        reason={reason}
        reasonError={reasonError}
        fieldErrorReason={fieldErrors?.reason}
        onReasonChange={(e) => {
          setReason(e.target.value);

          if (reasonError) clearReasonError();
        }}
        submitting={submitting}
        hasSelectedSlot={Boolean(selectedSlot)}
        selectedSlotStart={selectedSlotStart}
        specialtyLabel={
          selectedDoctor?.specialty?.name ||
          specialties.find((s) => String(s.id) === String(selectedSpecialtyId))
            ?.name
        }
        doctorLabel={getDoctorName(selectedDoctor)}
        dateLabel={selectedSlotDateLabel}
        timeLabel={selectedSlotTimeLabel}
        onConfirm={confirmAppointment}
        onGoAppointments={() => navigate('/appointments')}
      />
    </div>
  );
}

export default PatientHome;
