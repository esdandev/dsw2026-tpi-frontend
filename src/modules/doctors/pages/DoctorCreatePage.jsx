import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import { doctorsService } from '../services/doctorsService';
import { specialtiesService } from '../../specialties/services/specialtiesService';
import { parseBackendError } from '../../shared/helpers/backendError';

function DoctorCreatePage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');

  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let active = true;

    const loadSpecialties = async () => {
      try {
        const result = await specialtiesService.getAllForSelect();

        if (active) {
          setSpecialties(result);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error.response?.status === 403
              ? 'Acceso denegado para consultar las especialidades.'
              : 'No se pudieron cargar las especialidades.'
          );
        }
      } finally {
        if (active) {
          setLoadingSpecialties(false);
        }
      }
    };

    loadSpecialties();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanLicense = licenseNumber.trim();

    if (cleanName.length < 3 || cleanName.length > 100) {
      setErrorMessage('El nombre debe tener entre 3 y 100 caracteres.');

      return;
    }

    if (!cleanLicense || cleanLicense.length > 50) {
      setErrorMessage(
        'La licencia médica es obligatoria y admite hasta 50 caracteres.'
      );

      return;
    }

    if (!specialtyId) {
      setErrorMessage('Seleccioná una especialidad.');

      return;
    }

    setSaving(true);
    setErrorMessage('');
    setFieldErrors({});

    try {
      await doctorsService.create({
        name: cleanName,
        licenseNumber: cleanLicense,
        specialtyId,
      });
      navigate('/admin/doctors');
    } catch (error) {
      const parsed = parseBackendError(error);

      setErrorMessage(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSaving(false);
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
        <span> › Agregar Nuevo Doctor</span>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-med-text-main">
          Agregar Nuevo Doctor
        </h1>

        <p className="text-sm text-med-text-sub mt-1">
          Completá los datos del profesional médico.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {errorMessage}
            </p>
          )}
          {Object.entries(fieldErrors).map(([field, message]) => (
            <p key={field} role="alert" className="text-sm text-red-700">
              {field}: {message}
            </p>
          ))}

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
              className="w-full rounded-lg border border-med-border px-3 py-2.5 text-sm"
              placeholder="Ej.: Dra. María González"
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
              className="w-full rounded-lg border border-med-border px-3 py-2.5 text-sm"
              placeholder="Ej.: MP-12345"
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
              disabled={loadingSpecialties || specialties.length === 0}
              className="w-full rounded-lg border border-med-border bg-white px-3 py-2.5 text-sm"
            >
              <option value="">
                {loadingSpecialties
                  ? 'Cargando especialidades...'
                  : 'Seleccionar especialidad'}
              </option>

              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>

            {!loadingSpecialties && specialties.length === 0 && (
              <p className="text-xs text-med-text-sub">
                No hay especialidades disponibles para asignar.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-med-border">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate('/admin/doctors')}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={
                saving || loadingSpecialties || specialties.length === 0
              }
            >
              {saving ? 'Guardando...' : 'Guardar Médico'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default DoctorCreatePage;
