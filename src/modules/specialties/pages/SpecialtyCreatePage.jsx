import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Input from '../../shared/components/Input';
import { useSpecialties } from '../hooks/useSpecialties';

function SpecialtyCreatePage() {
  const navigate = useNavigate();
  const { createSpecialty, error, fieldErrors } = useSpecialties({
    pageIndex: 0,
    pageSize: 1,
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [localErrors, setLocalErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const getNameError = (value) => {
    const trimmed = value.trim();

    if (!trimmed) return 'El nombre es obligatorio.';

    if (trimmed.length < 3)
      return 'El nombre debe tener al menos 3 caracteres.';

    if (trimmed.length > 100) {
      return `Se excedió el límite de 100 caracteres (${trimmed.length}/100).`;
    }

    return undefined;
  };

  const getDescriptionError = (value) => {
    const trimmed = value.trim();

    if (!trimmed) return 'La descripción es obligatoria.';

    if (trimmed.length < 10) {
      return 'La descripción debe tener al menos 10 caracteres.';
    }

    if (trimmed.length > 100) {
      return `Se excedió el límite de 100 caracteres (${trimmed.length}/100).`;
    }

    return undefined;
  };
  const validate = () => {
    const errors = {
      name: getNameError(name),
      description: getDescriptionError(description),
    };

    setLocalErrors(errors);

    return !errors.name && !errors.description;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    const res = await createSpecialty({
      name: name.trim(),
      description: description.trim(),
    });

    setSubmitting(false);

    if (res.ok) {
      navigate('/admin/specialties');
    }
  };

  const isDuplicateError =
    error?.toLowerCase().includes('ya existe una especialidad') ||
    error?.toLowerCase().includes('duplicad') ||
    error?.includes('SPECIALITY_NAME_CONFLICT');

  const nameError =
    localErrors.name ||
    fieldErrors.name ||
    (isDuplicateError ? 'Nombre duplicado' : undefined);

  const descriptionError = localErrors.description || fieldErrors.description;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Breadcrumb */}
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
          Agregar Nueva Especialidad
        </span>
      </nav>

      {/* Cabecera */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-med-text-main">
          Agregar Nueva Especialidad
        </h1>
        <p className="text-sm text-med-text-sub mt-1">
          Complete los datos para registrar una nueva categoría médica en el
          sistema.
        </p>
      </div>

      {/* Formulario */}
      <Card className="p-6 border-med-border">
        {error && !isDuplicateError && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <Input
              label="Nombre de la Especialidad"
              placeholder="Ej. Cardiología Intervencionista"
              value={name}
              onChange={(e) => {
                const val = e.target.value;

                setName(val);
                setLocalErrors((prev) => ({
                  ...prev,
                  name: val.trim().length > 100 ? getNameError(val) : undefined,
                }));
              }}
              error={nameError}
            />

            <div className="flex justify-end mt-1">
              <span
                className={`text-[11px] ${
                  name.trim().length > 100
                    ? 'text-red-600 font-semibold'
                    : 'text-med-text-muted'
                }`}
              >
                {name.trim().length}/100
              </span>
            </div>
          </div>

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
              placeholder="Detalle el alcance clínico de la especialidad (mínimo 10 caracteres)..."
              value={description}
              onChange={(e) => {
                const val = e.target.value;

                setDescription(val);
                setLocalErrors((prev) => ({
                  ...prev,
                  description:
                    val.trim().length > 100
                      ? getDescriptionError(val)
                      : undefined,
                }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-1 ${
                descriptionError
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-med-border focus:ring-med-primary-600'
              }`}
            />
            <div className="flex items-center justify-between">
              {descriptionError ? (
                <span role="alert" className="text-xs text-red-600">
                  {descriptionError}
                </span>
              ) : (
                <span className="text-[11px] text-med-text-muted">
                  Entre 10 y 100 caracteres.
                </span>
              )}
              <span
                className={`text-[11px] ${
                  description.trim().length > 100
                    ? 'text-red-600 font-semibold'
                    : 'text-med-text-muted'
                }`}
              >
                {description.trim().length}/100
              </span>
            </div>
          </div>

          {/* Footer */}
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
              disabled={submitting}
              className="bg-med-primary-900 hover:bg-med-primary-800 text-white"
            >
              {submitting ? 'Guardando...' : 'Guardar Especialidad'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SpecialtyCreatePage;
