export const ERROR_CODE_MESSAGES = {
  APPOINTMENT_CONFLICT:
    'El turno seleccionado ya no se encuentra disponible. Elegí otro horario.',
  DOCTOR_INACTIVE: 'El profesional seleccionado no se encuentra activo.',
  PATIENT_DNI_CONFLICT: 'Ya existe un paciente registrado con ese DNI.',
  SPECIALITY_NAME_CONFLICT:
    'Ya existe una especialidad registrada con ese nombre.',
  DOCTOR_LICENSE_CONFLICT: 'Ya existe un médico registrado con esa matrícula.',
  DOCTOR_HAS_FUTURE_APPOINTMENTS:
    'No se puede eliminar el médico porque tiene turnos futuros reservados.',
  AVAILABILITY_OVERLAP:
    'La franja horaria se superpone con otra disponibilidad existente.',
  AVAILABILITY_SLOT_CONFLICT:
    'Existe un conflicto con los bloques horarios configurados.',
  APPOINTMENT_SLOT_CONFLICT:
    'El bloque horario elegido entra en conflicto con otra reserva.',
  RATE_LIMIT_EXCEEDED:
    'Realizaste demasiadas solicitudes seguidas. Esperá unos segundos e intentá nuevamente.',
  DATA_INTEGRITY_CONFLICT:
    'No se puede completar la operación porque existen registros asociados.',
  ENTITY_NOTFOUND: 'No se encontró el registro solicitado.',
  AUTHENTICATION_FAILED:
    'Credenciales inválidas o sesión expirada. Volvé a iniciar sesión.',
  AUTHORIZATION_FAILED: 'No tenés permisos para realizar esta acción.',
  VALIDATION_ERROR: 'Revisá los datos ingresados; hay campos con errores.',
  UNHANDLED_ERROR:
    'Ocurrió un error inesperado en el servidor. Intentá más tarde.',
};

export const HTTP_STATUS_MESSAGES = {
  400: 'Los datos enviados no son válidos. Verificá los campos e intentá nuevamente.',
  401: 'Tu sesión expiró o no iniciaste sesión. Ingresá nuevamente.',
  403: 'No tenés permisos suficientes para acceder a este recurso.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación generó un conflicto con el estado actual de los datos.',
  429: 'Demasiadas peticiones en poco tiempo. Aguardá un momento antes de reintentar.',
  500: 'Error interno del servidor. Por favor, intentá nuevamente en unos minutos.',
};

const ISSUE_MESSAGES = {
  required: 'Este campo es obligatorio.',
  invalid_format: 'El formato ingresado no es válido.',
  min_length: 'El valor ingresado es demasiado corto.',
  max_length: 'El valor ingresado supera el máximo permitido.',
  slot_unavailable: 'Este horario ya no está disponible.',
  slot_inavailable: 'Este horario ya no está disponible.',
  past_date: 'No se permiten fechas u horarios pasados.',
  overlap: 'El horario se superpone con otro existente.',
  license_already_registered: 'La matrícula ya está registrada.',
  speciality_name_already_exists: 'Ya existe una especialidad con ese nombre.',
  dni_already_registered: 'El DNI ya está registrado.',
  slot_already_booked: 'Este horario ya está reservado.',
  doctor_slot_already_exists: 'Ya existe un bloque para ese horario.',
};

function formatIssue(issue) {
  if (!issue) return 'Valor inválido.';

  if (ISSUE_MESSAGES[issue]) return ISSUE_MESSAGES[issue];

  // Los issues ya traducidos por el back llegan en español: se muestran tal cual.
  // Solo se reemplaza lo que tiene forma de código (snake_case).
  return /^[a-z0-9]+(_[a-z0-9]+)+$/.test(issue) ? 'Valor inválido.' : issue;
}

export function parseBackendError(error) {
  if (!error?.response) {
    const isTimeout =
      error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '');

    return {
      status: null,
      errorCode: isTimeout ? 'TIMEOUT_ERROR' : 'NETWORK_ERROR',
      message: isTimeout
        ? 'La conexión tardó demasiado. Verificá tu conexión y reintentá.'
        : 'No se pudo conectar con el servidor. Verificá tu conexión a internet y reintentá.',
      fieldErrors: {},
    };
  }

  const { status, data } = error.response;
  const errorCode = data?.errorCode || null;
  const details = Array.isArray(data?.details) ? data.details : [];

  const fieldErrors = {};

  for (const item of details) {
    if (item?.field && !fieldErrors[item.field]) {
      fieldErrors[item.field] = formatIssue(item.issue);
    }
  }

  const message =
    (errorCode && ERROR_CODE_MESSAGES[errorCode]) ||
    HTTP_STATUS_MESSAGES[status] ||
    'No se pudo completar la operación. Intentá nuevamente.';

  return {
    status,
    errorCode,
    message,
    fieldErrors,
  };
}
