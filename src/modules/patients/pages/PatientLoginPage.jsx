import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../shared/components/Button';
import useAuth from '../../auth/hook/useAuth';

function PatientLoginPage() {
  const [errorMessage, setErrorMessage] = useState('');

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

  const navigate = useNavigate();
  const { singinPatient } = useAuth();

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
    'w-full border border-med-border rounded-lg px-3.5 py-2.5 text-sm bg-white text-med-text-main focus:outline-none focus:ring-2 focus:ring-med-primary-600';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-med-primary-950 px-4 py-8 sm:p-6">
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

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-white/10 p-6 sm:p-10">
        <h2 className="text-xl font-bold text-med-primary-900">
          Portal del Paciente
        </h2>

        <p className="text-xs text-med-text-sub mt-1 mb-6">
          Ingresá con tu correo electrónico y DNI para reservar turnos.
        </p>

        <form
          noValidate
          onSubmit={handleSubmit(onValid)}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="patient-email"
              className="text-xs font-semibold text-med-text-main"
            >
              Correo electrónico
            </label>

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

            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="patient-dni"
              className="text-xs font-semibold text-med-text-main"
            >
              DNI
            </label>

            <input
              id="patient-dni"
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="12345678"
              className={inputClass}
              {...register('dni', {
                required: 'El DNI es obligatorio',
                pattern: {
                  value: /^\d{7,8}$/,
                  message: 'El DNI debe tener 7 u 8 dígitos numéricos',
                },
              })}
            />

            {errors.dni && (
              <p className="text-xs text-red-500">{errors.dni.message}</p>
            )}
          </div>

          <p className="text-xs text-med-text-sub">
            Podés completar tu nombre y apellido para que figuren en tus turnos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="patient-name"
                className="text-xs font-semibold text-med-text-main"
              >
                Nombre (opcional)
              </label>

              <input
                id="patient-name"
                type="text"
                maxLength={100}
                className={inputClass}
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
                htmlFor="patient-lastname"
                className="text-xs font-semibold text-med-text-main"
              >
                Apellido (opcional)
              </label>

              <input
                id="patient-lastname"
                type="text"
                maxLength={100}
                className={inputClass}
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

          <Button type="submit" disabled={isSubmitting} className="w-full mt-1">
            {isSubmitting ? 'Ingresando...' : 'Ingresar como paciente'}
          </Button>

          {errorMessage && (
            <div
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center"
              role="alert"
            >
              {errorMessage}
            </div>
          )}
        </form>
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/admin/login"
          className="text-xs text-med-primary-200 hover:text-white transition"
        >
          ¿Es personal administrativo o médico? Ingrese aquí →
        </Link>
      </div>
    </div>
  );
}

export default PatientLoginPage;
