import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import { specialtiesService } from '../services/specialtiesService';
import { parseBackendError } from '../../shared/helpers/backendError';

function SpecialtyEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [localErrors, setLocalErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const list = await specialtiesService.getAllForSelect();
        const specialty = list.find((item) => item.id === id);

        if (!active) return;

        if (!specialty) {
          setNotFound(true);

          return;
        }

        setName(specialty.name || '');
        setDescription(specialty.description || '');
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

  const validate = () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    const errors = {
      name: !trimmedName
        ? 'El nombre es obligatorio.'
        : trimmedName.length < 3
          ? 'El nombre debe tener al menos 3 caracteres.'
          : trimmedName.length > 100
            ? `Se excedió el límite de 100 caracteres (${trimmedName.length}/100).`
            : undefined,
      description: !trimmedDescription
        ? 'La descripción es obligatoria.'
        : trimmedDescription.length < 10
          ? 'La descripción debe tener al menos 10 caracteres.'
          : trimmedDescription.length > 100
            ? `Se excedió el límite de 100 caracteres (${trimmedDescription.length}/100).`
            : undefined,
    };

    setLocalErrors(errors);

    return !errors.name && !errors.description;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setError('');

    try {
      await specialtiesService.update(id, {
        name: name.trim(),
        description: description.trim(),
      });
      navigate('/admin/specialties');
    } catch (err) {
      setError(parseBackendError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-med-text-sub"
      >
        <Link
          to="/admin/specialties"
          className="hover:text-med-primary-900 font-medium transition-colors"
        >
          Especialidades
        </Link>
        <span>›</span>
        <span className="text-med-text-main font-semibold">
          Editar Especialidad
        </span>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
          Editar Especialidad
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Actualizá los datos de la categoría médica.
        </p>
      </div>

      <Card className="p-6 border-med-border">
        {notFound ? (
          <div className="flex flex-col gap-4">
            <p role="alert" className="text-sm text-red-700">
              No se encontró la especialidad solicitada.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/specialties')}
            >
              Volver al listado
            </Button>
          </div>
        ) : (
          <>
            {error && !localErrors.name && (
              <p
                role="alert"
                className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Nombre de la Especialidad"
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={localErrors.name}
                disabled={loading || submitting}
              />

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="specialty-description"
                  className="text-xs font-semibold text-med-text-main"
                >
                  Descripción
                </label>
                <textarea
                  id="specialty-description"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={loading || submitting}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 ${
                    localErrors.description
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-med-border focus:ring-med-primary-600'
                  }`}
                />
                {localErrors.description && (
                  <span role="alert" className="text-xs text-red-600">
                    {localErrors.description}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-med-border">
                <Button
                  type="button"
                  onClick={() => navigate('/admin/specialties')}
                  className="bg-white border border-med-border text-med-text-main hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || submitting}
                  className="bg-med-primary-900 hover:bg-med-primary-800 text-white"
                >
                  {submitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}

export default SpecialtyEditPage;
