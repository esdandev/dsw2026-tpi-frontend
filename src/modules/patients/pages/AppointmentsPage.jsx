import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import AsyncState from '../../shared/components/AsyncState';
import {
  formatTimeAR,
  toApiDateFilter,
} from '../../shared/helpers/dateArgentina';
import useAuth from '../../auth/hook/useAuth';
import { usePatientAppointments } from '../../appointments/hooks/useAppointments';

function getDoctorDisplayName(appt) {
  const doc = appt.doctor;

  return (
    appt.doctorName ||
    doc?.fullName ||
    doc?.name ||
    [doc?.firstName, doc?.lastName].filter(Boolean).join(' ') ||
    'Profesional asignado'
  );
}

function mapAppointmentStatus(status) {
  const normalized = String(status || '').toUpperCase();

  if (normalized === 'BOOKED') return 'Confirmado';

  return status || 'Confirmado';
}

function AppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
const patientDni =
    user?.dni ||
    localStorage.getItem('dni') ||
    '';
    
  const {
    appointments,
    loading,
    error,
    isEmpty,
    refetch,
    cancelAppointment,
  } = usePatientAppointments(patientDni);

  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleCancel = async (appt) => {
    const rawDate = appt.startTime || appt.date || appt.slotDate;
    const confirmed = window.confirm(
      `¿Confirmás la cancelación del turno con ${getDoctorDisplayName(appt)} del ${toApiDateFilter(rawDate)} a las ${formatTimeAR(rawDate)} hs?`
    );

    if (!confirmed) return;

    setActionError('');
    setCancellingId(appt.id);
    const res = await cancelAppointment(appt.id);
    setCancellingId(null);

    if (!res.ok) {
      setActionError(
        res.error?.message ||
          'No se pudo cancelar el turno. Intentá nuevamente.'
      );
      await refetch();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
            Mis Turnos Médicos
          </h1>
          <p className="text-sm text-med-text-sub mt-1">
            Consulta y gestiona las citas médicas programadas.
          </p>
        </div>
        <Button
          onClick={() => navigate('/')}
          className="bg-med-primary-900 hover:bg-med-primary-800 text-white"
        >
          + Solicitar Nuevo Turno
        </Button>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {actionError}
        </div>
      )}

      <AsyncState
        loading={loading}
        error={appointments.length === 0 ? error : null}
        isEmpty={isEmpty}
        onRetry={refetch}
        emptyTitle="No tenés turnos programados"
        emptyDescription="Podés solicitar un nuevo turno médico desde el botón superior."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((appt) => {
            const rawDate = appt.startTime || appt.date || appt.slotDate;
            const specialtyName =
              appt.specialtyName || appt.specialty?.name || '';
            const statusLabel = mapAppointmentStatus(appt.status);
            const isCancelling = cancellingId === appt.id;

            return (
              <Card
                key={appt.id}
                className="flex flex-col justify-between gap-4 p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {specialtyName ? (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-primary-100 text-med-primary-700">
                        {specialtyName}
                      </span>
                    ) : (
                      <span />
                    )}

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-med-active-bg text-med-active-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusLabel}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-med-primary-900">
                    {getDoctorDisplayName(appt)}
                  </h3>

                  <p className="text-sm text-med-text-sub mt-2">
                    Fecha:{' '}
                    <strong className="text-med-text-main font-semibold">
                      {toApiDateFilter(rawDate)}
                    </strong>{' '}
                    a las{' '}
                    <strong className="text-med-text-main font-semibold">
                      {formatTimeAR(rawDate)} hs
                    </strong>
                  </p>
                </div>

                <div className="flex gap-2 pt-3 border-t border-med-border">
                  <Button
                    variant="outline"
                    disabled={isCancelling}
                    className="w-full text-xs"
                    onClick={() => handleCancel(appt)}
                  >
                    {isCancelling ? 'Cancelando...' : 'Cancelar Turno'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </AsyncState>
    </div>
  );
}

export default AppointmentsPage;
