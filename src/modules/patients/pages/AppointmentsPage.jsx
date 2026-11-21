import { useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import AsyncState from '../../shared/components/AsyncState';
import { formatDateAR, formatTimeAR } from '../../shared/helpers/dateArgentina';
import useAuth from '../../auth/hook/useAuth';
import { usePatientAppointments } from '../../appointments/hooks/useAppointments';

function AppointmentsPage() {
  const navigate = useNavigate();
  const { dni: patientDni } = useAuth();

  const { appointments, loading, error, isEmpty, refetch, cancelAppointment } =
    usePatientAppointments(patientDni);

  const handleCancel = async (appointmentId) => {
    if (window.confirm('¿Querés cancelar este turno?')) {
      await cancelAppointment(appointmentId);
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
        <Button onClick={() => navigate('/')}>+ Solicitar Nuevo Turno</Button>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        isEmpty={isEmpty}
        onRetry={refetch}
        emptyTitle="No tenés turnos programados"
        emptyDescription="Podés solicitar un nuevo turno médico desde el botón superior."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((appt) => {
            const rawDate = appt.startTime || appt.date || appt.slotDate;
            const statusUpper = String(appt.status || '').toUpperCase();
            const isCancelled = statusUpper.includes('CANCEL');

            return (
              <Card
                key={appt.id}
                className="flex flex-col justify-between gap-4 p-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-med-primary-100 text-med-primary-700">
                      {appt.specialtyName || appt.specialty?.name || 'Consulta'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isCancelled
                          ? 'bg-med-danger-bg text-med-danger-text'
                          : 'bg-med-active-bg text-med-active-text'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {appt.status || 'Confirmado'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-med-primary-900">
                    {appt.doctorName || appt.doctor?.name}
                  </h3>
                  <p className="text-sm text-med-text-sub mt-2">
                    Fecha:{' '}
                    <strong className="text-med-text-main font-semibold">
                      {formatDateAR(rawDate)}
                    </strong>{' '}
                    a las{' '}
                    <strong className="text-med-text-main font-semibold">
                      {formatTimeAR(rawDate)} hs
                    </strong>
                  </p>
                </div>

                {!isCancelled && (
                  <div className="flex gap-2 pt-3 border-t border-med-border">
                    <Button
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => handleCancel(appt.id)}
                    >
                      Cancelar Turno
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </AsyncState>
    </div>
  );
}

export default AppointmentsPage;
