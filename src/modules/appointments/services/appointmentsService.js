import { instance as axiosInstance } from '../../shared/api/axiosInstance';
import { getCached, invalidateByPrefix } from '../../shared/api/cache';
import { toApiDateFilter } from '../../shared/helpers/dateArgentina';

function normalizePagedAppointments(raw, pageIndex, pageSize) {
  if (Array.isArray(raw)) {
    return {
      data: raw,
      items: raw,
      total: raw.length,
      totalCount: raw.length,
      pageIndex,
      pageSize,
    };
  }

  const items = raw?.data ?? raw?.items ?? raw?.results ?? [];
  const totalCount =
    raw?.total ?? raw?.totalCount ?? raw?.count ?? items.length;

  return {
    data: items,
    items,
    total: Number(totalCount) || 0,
    totalCount: Number(totalCount) || 0,
    pageIndex: raw?.pageIndex ?? pageIndex,
    pageSize: raw?.pageSize ?? pageSize,
  };
}

export const appointmentsService = {
  async getAll({ pageIndex = 0, pageSize = 10, date = '' } = {}) {
    const params = {
      pageIndex,
      pageSize,
      date: toApiDateFilter(date || new Date()),
    };

    const data = await getCached(axiosInstance, '/api/appointments', {
      params,
    });

    return normalizePagedAppointments(data, pageIndex, pageSize);
  },

  async search({
    pageIndex = 0,
    pageSize = 10,
    specialtyId = '',
    doctorId = '',
    dni = '',
    date = '',
  } = {}) {
    const cleanDni = dni ? String(dni).replace(/\D/g, '') : '';
    const hasFilters = Boolean(specialtyId || doctorId || cleanDni || date);

    if (!hasFilters) {
      return this.getAll({ pageIndex, pageSize });
    }

    const params = { pageIndex, pageSize };

    if (specialtyId) params.specialtyId = specialtyId;

    if (doctorId) params.doctorId = doctorId;

    if (cleanDni) params.dni = cleanDni;

    if (date) params.date = toApiDateFilter(date);

    const data = await getCached(axiosInstance, '/api/appointments/search', {
      params,
    });

    return normalizePagedAppointments(data, pageIndex, pageSize);
  },

  async getByPatientDni(dni) {
    const data = await getCached(axiosInstance, '/api/appointments/patient', {
      params: { dni },
    });

    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async book(bookingInput) {
    invalidateByPrefix('/api/appointments');
    invalidateByPrefix('/api/doctors');
    const cleanDni = Number(
      String(
        bookingInput.patientDni ?? bookingInput.patient?.dni ?? ''
      ).replace(/\D/g, '')
    );

    const payload = {
      doctorId: bookingInput.doctorId,
      availabilitySlotId: bookingInput.availabilitySlotId,
      patient: {
        dni: cleanDni,
      },
      ...(bookingInput.reason ? { reason: bookingInput.reason } : {}),
    };

    const { data } = await axiosInstance.post('/api/appointments', payload);

    return data;
  },

  async cancel(appointmentId) {
    invalidateByPrefix('/api/appointments');
    invalidateByPrefix('/api/doctors');
    await axiosInstance.delete(`/api/appointments/${appointmentId}`);
  },
};
