import { instance } from '../../shared/api/axiosInstance';

// Obtener todos los registros de una API paginada
async function getAllPages(path, filters = {}) {
  const results = [];
  const pageSize = 100;

  let pageIndex = 0;
  let total = 0;

  do {
    const { data } = await instance.get(path, {
      params: {
        ...filters,
        pageSize,
        pageIndex,
      },
    });

    const page = data.data || [];

    results.push(...page);
    total = data.total || 0;

    if (page.length === 0) {
      break;
    }

    pageIndex += 1;
  } while (results.length < total);

  return results;
}

// Obtener especialidades reales
export function getBookingSpecialties() {
  return getAllPages('/api/specialties');
}

// Obtener médicos de una especialidad
export function getBookingDoctors(specialtyId) {
  return getAllPages('/api/doctors', { specialtyId });
}

// Obtener horarios disponibles de un médico
export async function getDoctorSlots(doctorId, from, to) {
  const { data } = await instance.get(`/api/doctors/${doctorId}/slots`, {
    params: {
      from,
      to,
    },
  });

  return data;
}

// Reservar un turno utilizando el DNI de la sesión
export async function createPatientAppointment({
  doctorId,
  availabilitySlotId,
  dni,
  reason,
}) {
  const { data } = await instance.post('/api/appointments', {
    doctorId,
    availabilitySlotId,
    patient: {
      dni: Number(dni),
    },
    reason: reason.trim(),
  });

  return data;
}

// Obtener los turnos del paciente autenticado
export async function getPatientAppointments(dni) {
  const { data } = await instance.get('/api/appointments/patient', {
    params: { dni },
  });

  return data;
}

// Cancelar un turno
export async function cancelPatientAppointment(id) {
  await instance.delete(`/api/appointments/${id}`);
}
