import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import AsyncState from '../../shared/components/AsyncState';
import {
  formatDateAR,
  formatDateTimeAR,
  formatTimeAR,
  toApiDateFilter,
} from '../../shared/helpers/dateArgentina';
import useAuth from '../../auth/hook/useAuth';
import { specialtiesService } from '../../specialties/services/specialtiesService';
import { doctorsService } from '../../doctors/services/doctorsService';
import { useDoctorAvailabilities } from '../../availabilities/hooks/useAvailabilities';
import { usePatientAppointments } from '../../appointments/hooks/useAppointments';

function PatientHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const patientDni = user?.dni || '';

  const [specialtiesOptions, setSpecialtiesOptions] = useState([]);
  const [doctorsOptions, setDoctorsOptions] = useState([]);

  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [confirmedModal, setConfirmedModal] = useState(false);

  const {
    availabilities,
    loading: loadingSlots,
    error: errorSlots,
    isEmpty: isEmptySlots,
    refetch: refetchSlots,
  } = useDoctorAvailabilities(selectedDoctorId);

  const {
    error: bookingError,
    fieldErrors,
    bookAppointment,
  } = usePatientAppointments(patientDni);

  useEffect(() => {
    let isMounted = true;

    specialtiesService
      .getAllForSelect()
      .then((list) => {
        if (!isMounted) return;

        setSpecialtiesOptions(list);

        if (list.length > 0) {
          setSelectedSpecialtyId(String(list[0].id));
        }
      })
      .catch(() => {
        if (isMounted) setSpecialtiesOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedSpecialtyId) return;

    let isMounted = true;

    doctorsService
      .getAllForSelect({ specialtyId: selectedSpecialtyId })
      .then((list) => {
        if (!isMounted) return;

        setDoctorsOptions(list);
        const firstId = list.length > 0 ? String(list[0].id) : '';

        setSelectedDoctorId(firstId);
        setSelectedSlot(null);
      })
      .catch(() => {
        if (isMounted) {
          setDoctorsOptions([]);
          setSelectedDoctorId('');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSpecialtyId]);

  const currentDoctor = useMemo(
    () =>
      doctorsOptions.find(
        (doc) => String(doc.id) === String(selectedDoctorId)
      ) || null,
    [doctorsOptions, selectedDoctorId]
  );

  // Agrupa los slots disponibles por fecha Argentina (YYYY-MM-DD)
  const groupedSlotsByDate = useMemo(() => {
    const groups = {};

    for (const item of availabilities) {
      const dateKey =
        toApiDateFilter(item.startTime || item.date) ||
        item.day ||
        'Disponible';

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(item);
    }

    return Object.entries(groups);
  }, [availabilities]);

  const handleConfirmAppointment = async () => {
    if (!selectedDoctorId || !selectedSlot) return;

    const res = await bookAppointment({
      doctorId: selectedDoctorId,
      availabilitySlotId: selectedSlot.id,
      patientDni,
      reason,
    });

    if (res.ok) {
      setConfirmedModal(true);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* 1. Card Superior: Selector de Especialidad y Doctor */}
      <Card className="p-6 sm:p-7">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-primary-900">
            Reservar Turno Médico
          </h1>
          <p className="text-xs sm:text-sm text-med-text-sub mt-1">
            Seleccione la especialidad y el profesional para continuar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Especialidad */}
          <div className="md:col-span-5 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Seleccionar Especialidad
            </label>
            <select
              value={selectedSpecialtyId}
              onChange={(e) => setSelectedSpecialtyId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600 cursor-pointer"
            >
              <option value="">Seleccione especialidad...</option>
              {specialtiesOptions.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor */}
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-med-text-sub">
              Seleccionar Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-med-border rounded-lg text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600 cursor-pointer"
            >
              <option value="">Seleccione profesional...</option>
              {doctorsOptions.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Refrescar Disponibilidad */}
          <div className="md:col-span-3">
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium py-2.5 rounded-lg shadow-sm"
              onClick={refetchSlots}
            >
              <span>Buscar Disponibilidad</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Card de Información del Doctor Seleccionado */}
      {currentDoctor && (
        <Card className="p-5 sm:p-6 flex items-center gap-4 border-med-border">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-med-primary-100 text-med-primary-700 font-bold text-lg flex items-center justify-center border border-med-primary-200 shrink-0">
            {currentDoctor.name?.slice(0, 2).toUpperCase()}
          </div>

          <div className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-med-primary-900">
                {currentDoctor.name}
              </h2>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-med-primary-100 text-med-primary-700">
                Matrícula: {currentDoctor.licenseNumber}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-med-text-sub mt-0.5">
              {currentDoctor.specialty?.name || currentDoctor.specialtyName}
            </p>
          </div>
        </Card>
      )}

      {/* 3. Selector de Disponibilidad */}
      <Card className="p-5 sm:p-6 border-med-border">
        <div className="flex items-center justify-between pb-4 border-b border-med-border-subtle">
          <span className="font-bold text-sm sm:text-base text-med-primary-900">
            Horarios Disponibles (Zona Horaria Argentina)
          </span>
        </div>

        <div className="pt-5">
          <AsyncState
            loading={loadingSlots}
            error={errorSlots}
            isEmpty={isEmptySlots}
            onRetry={refetchSlots}
            emptyTitle="Sin turnos disponibles"
            emptyDescription="El profesional seleccionado no tiene bloques horarios disponibles."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {groupedSlotsByDate.map(([dateKey, slots]) => (
                <div
                  key={dateKey}
                  className="p-3.5 rounded-xl border border-med-border bg-white flex flex-col gap-2.5"
                >
                  <p className="text-xs font-bold text-med-primary-900 border-b border-med-border-subtle pb-1.5">
                    {formatDateAR(dateKey) || dateKey}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;

                      return (
                        <button
                          key={`${slot.id}-${slot.day || dateKey}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                              : 'bg-white border-med-border text-med-primary-900 hover:border-med-primary-600 hover:bg-med-primary-50/50'
                          }`}
                        >
                          {formatTimeAR(slot.startTime)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </AsyncState>
        </div>
      </Card>

      {/* 4. Motivo de Consulta + Banner de Confirmación */}
      <Card className="p-5 sm:p-6 border-med-border">
        <Input
          label="Motivo de la consulta (opcional)"
          placeholder="Ej. Control cardiológico anual..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={fieldErrors.reason}
        />

        {bookingError && (
          <p className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {bookingError}
          </p>
        )}

        <div className="mt-4 bg-med-primary-50 border border-med-primary-200/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="border-l-4 border-med-primary-900 pl-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-med-text-sub">
              Resumen de Selección
            </span>
            <p className="text-base sm:text-lg font-bold text-med-primary-900 mt-0.5">
              {selectedSlot
                ? `${formatDateTimeAR(selectedSlot.startTime)} HS`
                : 'Seleccioná un horario disponible'}
            </p>
            <p className="text-xs text-med-text-sub mt-0.5">
              {currentDoctor ? currentDoctor.name : 'Profesional pendiente'} •
              Duración: 30 min
            </p>
          </div>

          <Button
            type="button"
            disabled={!selectedSlot || !currentDoctor}
            onClick={handleConfirmAppointment}
            className="flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl shadow-md text-sm shrink-0"
          >
            <span>Confirmar Turno</span>
          </Button>
        </div>
      </Card>

      {/* Modal de Confirmación Exitosa */}
      {confirmedModal && selectedSlot && currentDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-med-primary-900">
              ¡Turno Confirmado con Éxito!
            </h3>
            <p className="text-xs text-med-text-sub mt-2 leading-relaxed">
              Tu turno con{' '}
              <strong className="text-med-text-main">
                {currentDoctor.name}
              </strong>{' '}
              ha sido reservado para el{' '}
              <strong className="text-med-text-main">
                {formatDateTimeAR(selectedSlot.startTime)} hs
              </strong>
              .
            </p>

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
                onClick={() => {
                  setConfirmedModal(false);
                  setSelectedSlot(null);
                  setReason('');
                  refetchSlots();
                }}
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
