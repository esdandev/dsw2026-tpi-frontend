import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { doctorsService } from '../services/doctorsService';
import { specialtiesService } from '../../specialties/services/specialtiesService';
import { parseBackendError } from '../../shared/helpers/backendError';

function DoctorEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [doctorList, specialtyList] = await Promise.all([
          doctorsService.getAllForSelect(),
          specialtiesService.getAllForSelect(),
        ]);

        if (!active) return;

        setSpecialties(specialtyList);

        const doctor = doctorList.find((item) => item.id === id);

        if (!doctor) {
          setNotFound(true);

          return;
        }

        setName(doctor.name || '');
        setLicenseNumber(doctor.licenseNumber || '');
        setSpecialtyId(
          String(doctor.specialtyId ?? doctor.specialty?.id ?? '')
        );
      } catch (err) {
        if (active) setError(parseBackendError(err).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!name.trim() || !licenseNumber.trim() || !specialtyId) {
      setError('Completá nombre, matrícula y especialidad.');

      return;
    }

    setSubmitting(true);

    try {
      await doctorsService.update(id, {
        name: name.trim(),
        licenseNumber: licenseNumber.trim(),
        specialtyId,
      });
      navigate('/admin/doctors');
    } catch (err) {
      setError(parseBackendError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <nav
        aria-label="Ruta de navegación"
        className="text-sm text-med-text-sub"
      >
        <Link to="/admin/doctors" className="hover:text-med-primary-900">
          Doctores
        </Link>
        <span> › Editar Doctor</span>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-text-main">
          Editar Doctor
        </h1>

        <p className="text-sm text-med-text-sub mt-1">
          Actualizá los datos del profesional médico.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        {notFound ? (
          <div className="flex flex-col gap-4">
            <p role="alert" className="text-sm text-red-700">
              No se encontró el doctor solicitado.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/doctors')}
            >
              Volver al listado
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="doctor-name"
                className="text-sm font-semibold text-med-text-main"
              >
                Nombre del médico
              </label>

              <input
                id="doctor-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={3}
                maxLength={100}
                required
                disabled={loading || submitting}
                className="w-full rounded-lg border border-med-border px-3 py-2.5 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="doctor-license"
                className="text-sm font-semibold text-med-text-main"
              >
                Número de Licencia Médica
              </label>

              <input
                id="doctor-license"
                type="text"
                value={licenseNumber}
                onChange={(event) => setLicenseNumber(event.target.value)}
                maxLength={50}
                required
                disabled={loading || submitting}
                className="w-full rounded-lg border border-med-border px-3 py-2.5 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="doctor-specialty"
                className="text-sm font-semibold text-med-text-main"
              >
                Especialidad
              </label>

              <select
                id="doctor-specialty"
                value={specialtyId}
                onChange={(event) => setSpecialtyId(event.target.value)}
                required
                disabled={loading || submitting}
                className="w-full rounded-lg border border-med-border bg-white px-3 py-2.5 text-sm"
              >
                <option value="">Seleccionar especialidad</option>

                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-med-border">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate('/admin/doctors')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || submitting}>
                {submitting ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default DoctorEditPage;
