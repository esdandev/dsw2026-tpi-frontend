import { instance as axiosInstance } from '../../shared/api/axiosInstance';
import { getCached, invalidateByPrefix } from '../../shared/api/cache';

export const specialtiesService = {
  async getAll({ pageIndex = 0, pageSize = 10, name = '' } = {}) {
    const params = { pageIndex, pageSize };

    if (name?.trim()) params.name = name.trim();

    return getCached(axiosInstance, '/api/specialties', { params });
  },

  async getAllForSelect() {
    const firstPage = await this.getAll({ pageIndex: 0, pageSize: 100 });

    if (firstPage.total <= firstPage.data.length) return firstPage.data;

    const items = [...firstPage.data];
    let pageIndex = 1;

    while (items.length < firstPage.total) {
      const next = await this.getAll({ pageIndex, pageSize: 100 });

      if (!next.data?.length) break;

      items.push(...next.data);
      pageIndex += 1;
    }

    return items;
  },

  async create(payload) {
    invalidateByPrefix('/api/specialties');
    invalidateByPrefix('/api/doctors');
    invalidateByPrefix('/api/appointments');
    const { data } = await axiosInstance.post('/api/specialties', payload);

    return data;
  },

  async update(id, payload) {
    invalidateByPrefix('/api/specialties');
    invalidateByPrefix('/api/doctors');
    invalidateByPrefix('/api/appointments');
    const { data } = await axiosInstance.put(`/api/specialties/${id}`, payload);

    return data;
  },

  async remove(id) {
    invalidateByPrefix('/api/specialties');
    invalidateByPrefix('/api/doctors');
    invalidateByPrefix('/api/appointments');
    await axiosInstance.delete(`/api/specialties/${id}`);
  },
};
