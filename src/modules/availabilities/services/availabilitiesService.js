import { instance as axiosInstance } from '../../shared/api/axiosInstance';
import { toApiDateFilter } from '../../shared/helpers/dateArgentina';

export const availabilitiesService = {
  async getByDoctor(doctorId) {
    if (!doctorId) return [];

    const { data } = await axiosInstance.get(
      `/api/doctors/${doctorId}/availabilities`
    );

    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async getSlots({ doctorId, from, to }) {
    if (!doctorId || !from || !to) return [];

    const { data } = await axiosInstance.get(`/api/doctors/${doctorId}/slots`, {
      params: {
        from: toApiDateFilter(from),
        to: toApiDateFilter(to),
      },
    });

    return Array.isArray(data) ? data : (data?.data ?? []);
  },
  async create(payload) {
    const { data } = await axiosInstance.post('/api/availabilities', payload);

    return data;
  },

  async update(payload) {
    const { data } = await axiosInstance.put('/api/availabilities', payload);

    return data;
  },
};
