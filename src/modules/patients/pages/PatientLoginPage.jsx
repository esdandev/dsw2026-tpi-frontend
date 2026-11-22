import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthActions from '../../auth/hook/useAuthActions';

function PatientLoginPage() {
  const [errorMessage, setErrorMessage] = useState('');
  const [showDni, setShowDni] = useState(false);

  const navigate = useNavigate();
  const { singinPatient } = useAuthActions();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      dni: '',
      firstName: '',
      lastName: '',
    },
  });

  const onValid = async (formData) => {
    setErrorMessage('');

    try {
      const { error } = await singinPatient(formData);

      if (error) {
        setErrorMessage(
          error.frontendErrorMessage || 'No se pudo iniciar sesión'
        );

        return;
      }

      navigate('/');
    } catch (error) {
      const status = error.response?.status;

      if (status === 400) {
        setErrorMessage('Revisá los datos ingresados');
      } else if (status === 401) {
        setErrorMessage('El correo electrónico o el DNI son incorrectos');
      } else if (status === 409) {
        setErrorMessage('El DNI ya está asociado a otra cuenta');
      } else if (status === 429) {
        setErrorMessage(
          'Demasiados intentos. Esperá unos minutos e intentá nuevamente'
        );
      } else {
        setErrorMessage('No se pudo conectar con el servicio de pacientes');
      }
    }
  };

  const inputClass =
    'w-full border border-med-border rounded-lg pl-10 pr-3.5 py-2.5 text-sm bg-white text-med-text-main placeholder-med-text-muted focus:outline-none focus:ring-2 focus:ring-med-primary-600';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-med-primary-950 px-4 py-8 sm:p-6">
      {/* Encabezado de marca */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <svg
            className="w-8 h-8 text-med-primary-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white">
          MedPortal
        </h1>
      </div>

      {/* Tarjeta principal */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div className="p-8 sm:p-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-med-primary-900">
              Portal del Paciente
            </h2>

            <p className="text-xs text-med-text-sub mt-1 leading-relaxed">
              Ingresá con tu correo electrónico y DNI para gestionar tus turnos.
            </p>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit(onValid)}
            className="flex flex-col gap-4"
          >
            {/* Correo electrónico */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="patient-email"
                className="text-xs font-semibold text-med-text-main"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-med-text-muted">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>

                <input
                  id="patient-email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className={inputClass}
                  {...register('email', {
                    required: 'El correo electrónico es obligatorio',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Ingresá un correo electrónico válido',
                    },
                  })}
                />
              </div>

              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* DNI */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="patient-dni"
                className="text-xs font-semibold text-med-text-main"
              >
                DNI
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-med-text-muted">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm2 5h4m-4 4h4m4-4h4m-4 4h4"
                    />
                  </svg>
                </span>

                <input
                  id="patient-dni"
                  type={showDni ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={8}
                  autoComplete="off"
                  placeholder="••••••••"
                  className={`${inputClass} pr-20`}
                  {...register('dni', {
                    required: 'El DNI es obligatorio',
                    pattern: {
                      value: /^\d{7,8}$/,
                      message: 'El DNI debe tener 7 u 8 dígitos numéricos',
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowDni((current) => !current)}
                  aria-label={showDni ? 'Ocultar DNI' : 'Mostrar DNI'}
                  className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-med-primary-700 hover:text-med-primary-900"
                >
                  {showDni ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              {errors.dni && (
                <p className="text-xs text-red-500">{errors.dni.message}</p>
              )}
            </div>

            {/* Datos opcionales */}
            <details className="rounded-lg border border-med-border p-3">
              <summary className="cursor-pointer text-xs font-semibold text-med-primary-900">
                Agregar nombre y apellido (opcional)
              </summary>

              <p className="mt-2 text-xs text-med-text-sub">
                Estos datos permiten mostrar tu nombre completo al personal
                administrativo.
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="patient-first-name"
                    className="text-xs font-semibold text-med-text-main"
                  >
                    Nombre
                  </label>

                  <input
                    id="patient-first-name"
                    type="text"
                    maxLength={100}
                    className="w-full border border-med-border rounded-lg px-3 py-2 text-sm"
                    {...register('firstName', {
                      maxLength: {
                        value: 100,
                        message: 'Máximo 100 caracteres',
                      },
                    })}
                  />

                  {errors.firstName && (
                    <p className="text-xs text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="patient-last-name"
                    className="text-xs font-semibold text-med-text-main"
                  >
                    Apellido
                  </label>

                  <input
                    id="patient-last-name"
                    type="text"
                    maxLength={100}
                    className="w-full border border-med-border rounded-lg px-3 py-2 text-sm"
                    {...register('lastName', {
                      maxLength: {
                        value: 100,
                        message: 'Máximo 100 caracteres',
                      },
                    })}
                  />

                  {errors.lastName && (
                    <p className="text-xs text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
            </details>

            {/* Botón de ingreso */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-med-primary-900 hover:bg-med-primary-800 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition disabled:opacity-60"
            >
              <span>
                {isSubmitting ? 'Ingresando...' : 'Ingresar Paciente'}
              </span>
              <span aria-hidden="true">→</span>
            </button>

            {/* Errores del servidor */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center"
              >
                {errorMessage}
              </div>
            )}
          </form>
        </div>

        {/* Información inferior */}
        <div className="bg-med-primary-50 border-t border-med-primary-100 p-4 sm:p-5">
          <p className="text-xs text-med-text-sub leading-relaxed">
            <strong className="text-med-text-main font-semibold">
              Acceso de pacientes:
            </strong>{' '}
            este portal utiliza correo electrónico y DNI; no solicita
            contraseña.
          </p>
        </div>
      </div>

      {/* Enlace al administrador */}
      <div className="mt-6 text-center">
        <Link
          to="/admin/login"
          className="text-xs text-med-primary-200 hover:text-white transition"
        >
          Ingresar como administrador →
        </Link>
      </div>
    </div>
  );
}

export default PatientLoginPage;
