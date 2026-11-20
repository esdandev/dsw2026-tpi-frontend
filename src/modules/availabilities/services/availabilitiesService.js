import { instance as axiosInstance } from '../../shared/api/axiosInstance';

export const availabilitiesService = {
  async getByDoctor(doctorId) {
    if (!doctorId) return [];

    const { data } = await axiosInstance.get(
      `/api/doctors/${doctorId}/availabilities`
    );

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
