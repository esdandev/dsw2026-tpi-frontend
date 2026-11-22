import { instance as axiosInstance } from '../../shared/api/axiosInstance';
import { getCached, invalidateByPrefix } from '../../shared/api/cache';
import { toApiDateFilter } from '../../shared/helpers/dateArgentina';

export const availabilitiesService = {
  async getByDoctor(doctorId) {
    if (!doctorId) return [];

    return getCached(axiosInstance, `/api/doctors/${doctorId}/availabilities`);
  },

  async getSlots({ doctorId, from, to }) {
    if (!doctorId || !from || !to) return [];

    return getCached(axiosInstance, `/api/doctors/${doctorId}/slots`, {
      params: {
        from: toApiDateFilter(from),
        to: toApiDateFilter(to),
      },
    });
  },
  async create(payload) {
    invalidateByPrefix('/api/doctors');
    const { data } = await axiosInstance.post('/api/availabilities', payload);

    return data;
  },

  async update(payload) {
    invalidateByPrefix('/api/doctors');
    const { data } = await axiosInstance.put('/api/availabilities', payload);

    return data;
  },
};
