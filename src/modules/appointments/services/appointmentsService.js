import { instance as axiosInstance } from '../../shared/api/axiosInstance';
import { toApiDateFilter } from '../../shared/helpers/dateArgentina';

export const appointmentsService = {
  async search({
    pageIndex = 0,
    pageSize = 10,
    specialtyId = '',
    doctorId = '',
    dni = '',
    date = '',
  } = {}) {
    const params = { pageIndex, pageSize };

    if (specialtyId) params.specialtyId = specialtyId;

    if (doctorId) params.doctorId = doctorId;

    if (dni?.toString().trim()) params.dni = dni.toString().trim();

    if (date) params.date = toApiDateFilter(date);

    const { data } = await axiosInstance.get('/api/appointments/search', {
      params,
    });

    return data;
  },

  async getByPatientDni(dni) {
    const { data } = await axiosInstance.get('/api/appointments/patient', {
      params: { dni },
    });

    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async book({ doctorId, availabilitySlotId, patientDni, reason }) {
    const payload = {
      doctorId,
      availabilitySlotId,
      patient: { dni: Number(patientDni) },
      reason: reason.trim(),
    };
    const { data } = await axiosInstance.post('/api/appointments', payload);

    return data;
  },

  async cancel(appointmentId) {
    await axiosInstance.delete(`/api/appointments/${appointmentId}`);
  },
};
