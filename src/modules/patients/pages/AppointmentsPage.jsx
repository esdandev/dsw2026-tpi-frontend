import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../auth/hook/useAuth';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import {
  getPatientAppointments,
  cancelPatientAppointment,
} from '../services/patientAppointments';

const statusLabels = {
  BOOKED: 'Reservado',
  CANCELLED: 'Cancelado',
  ATTENDED: 'Atendido',
  NO_SHOW: 'Ausente',
};

function AppointmentsPage() {
  const navigate = useNavigate();
  const { dni } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    let active = true;

    const loadAppointments = async () => {
      try {
        if (!dni) {
          setErrorMessage(
            'No se encontró el DNI de la sesión. Iniciá sesión nuevamente.'
          );

          return;
        }

        const data = await getPatientAppointments(dni);

        if (active) {
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.status === 403
              ? 'Acceso denegado para consultar estos turnos.'
              : 'No pudimos cargar tus turnos. Intentá nuevamente.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      active = false;
    };
  }, [dni]);

  const handleCancel = async (id) => {
    if (!window.confirm('¿Querés cancelar este turno?')) {
      return;
    }

    setCancelingId(id);
    setErrorMessage('');

    try {
      await cancelPatientAppointment(id);

      setAppointments((current) => current.filter((appt) => appt.id !== id));
    } catch (error) {
      setErrorMessage(
        error.response?.status === 409
          ? 'El turno ya no puede cancelarse.'
          : error.response?.status === 403
            ? 'Acceso denegado para cancelar este turno.'
            : 'No pudimos cancelar el turno. Intentá nuevamente.'
      );
    } finally {
      setCancelingId(null);
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
            Consultá y gestioná tus próximos turnos médicos.
          </p>
        </div>

        <Button onClick={() => navigate('/')}>+ Solicitar Nuevo Turno</Button>
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {loading && (
        <p className="text-sm text-med-text-sub">Cargando turnos...</p>
      )}

      {!loading && !errorMessage && appointments.length === 0 && (
        <Card className="p-6 text-sm text-med-text-sub">
          No tenés turnos próximos reservados.
        </Card>
      )}

      {!loading && appointments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((appt) => (
            <Card
              key={appt.id}
              className="flex flex-col justify-between gap-4 p-6"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-med-text-sub">
                    Turno médico
                  </span>

                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-med-active-bg text-med-active-text">
                    {statusLabels[appt.status] || appt.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-med-primary-900">
                  {appt.doctorName}
                </h3>

                <p className="text-sm text-med-text-sub mt-2">
                  Fecha:{' '}
                  <strong>
                    {new Date(appt.startTime).toLocaleString('es-AR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </strong>
                </p>

                <p className="text-sm text-med-text-sub mt-2">
                  Motivo: {appt.reason}
                </p>
              </div>

              {appt.status === 'BOOKED' && (
                <div className="flex gap-2 pt-3 border-t border-med-border">
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    disabled={cancelingId === appt.id}
                    onClick={() => handleCancel(appt.id)}
                  >
                    {cancelingId === appt.id
                      ? 'Cancelando...'
                      : 'Cancelar Turno'}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
