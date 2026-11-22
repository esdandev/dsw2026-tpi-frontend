import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { doctorsService } from '../services/doctorsService';
import { useDoctorAvailabilities } from '../../availabilities/hooks/useAvailabilities';
import AvailabilityForm from '../components/AvailabilityForm';

function DoctorAvailabilityPage() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [doctorError, setDoctorError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const {
    availabilities,
    loading,
    error,
    loadError,
    fieldErrors,
    refetch,
    saveAvailabilities,
  } = useDoctorAvailabilities(id);

  useEffect(() => {
    let active = true;

    const loadDoctor = async () => {
      setLoadingDoctor(true);
      try {
        const doctors = await doctorsService.getAllForSelect();

        if (active) {
          const selected = doctors.find((item) => item.id === id);

          setDoctor(selected || null);
          setDoctorError(
            selected ? '' : 'No se encontró el médico seleccionado.'
          );
        }
      } catch {
        if (active) {
          setDoctorError('No se pudo consultar la información del médico.');
        }
      } finally {
        if (active) setLoadingDoctor(false);
      }
    };

    loadDoctor();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (payload) => {
    setSaving(true);
    setSuccessMessage('');

    const isUpdate = availabilities.length > 0;
    const result = await saveAvailabilities(payload, isUpdate);

    if (result.ok) {
      setSuccessMessage('La disponibilidad se guardó correctamente.');
    }

    setSaving(false);
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <nav className="text-sm text-med-text-sub">
        <Link to="/admin/doctors" className="hover:text-med-primary-900">
          Doctores
        </Link>
        <span> › Disponibilidad horaria</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-med-primary-900 sm:text-3xl">
          Disponibilidad Horaria
        </h1>

        <p className="mt-1 text-sm text-med-text-sub">
          Administrá los días y horarios de atención del profesional.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-med-primary-900">
          {doctor?.name || 'Profesional seleccionado'}
        </h2>

        <p className="mt-1 text-sm text-med-text-sub">
          {doctor?.specialty?.name || 'Especialidad no disponible'}
        </p>

        {doctorError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {doctorError}
          </p>
        )}
      </Card>

      <div className="rounded-xl border border-med-primary-200 bg-med-primary-50 p-4">
        <p className="text-sm text-med-primary-900">
          Los horarios se configuran para el mes actual, en bloques de 30
          minutos. Al actualizar, las reservas existentes se conservan. Los
          feriados y horarios pasados no se ofrecen para reservar.
        </p>
      </div>

      {successMessage && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {successMessage}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>

          {Object.entries(fieldErrors).map(([field, message]) => (
            <p key={field} className="mt-1">
              {field}: {message}
            </p>
          ))}
        </div>
      )}

      {loading || loadingDoctor ? (
        <Card>
          <p className="text-sm text-med-text-sub">
            {saving
              ? 'Actualizando disponibilidades...'
              : 'Cargando horarios configurados...'}
          </p>
        </Card>
      ) : loadError ? (
        <Button variant="outline" onClick={refetch}>
          Reintentar consulta
        </Button>
      ) : !doctor ? (
        <p className="text-sm text-med-text-sub">
          Seleccioná un médico válido desde el directorio para configurar sus
          horarios.
        </p>
      ) : (
        <AvailabilityForm
          doctorId={id}
          initialAvailabilities={availabilities}
          saving={saving}
          onSave={handleSave}
          onEdited={() => setSuccessMessage('')}
        />
      )}
    </div>
  );
}

export default DoctorAvailabilityPage;
