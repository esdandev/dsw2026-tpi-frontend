import { instance as axiosInstance } from '../../shared/api/axiosInstance';

export const doctorsService = {
  async getAll({
    pageIndex = 0,
    pageSize = 10,
    name = '',
    specialtyId = '',
  } = {}) {
    const params = { pageIndex, pageSize };

    if (name?.trim()) params.name = name.trim();

    if (specialtyId) params.specialtyId = specialtyId;

    const { data } = await axiosInstance.get('/api/doctors', { params });

    return data;
  },

  async getAllForSelect({ specialtyId = '' } = {}) {
    const firstPage = await this.getAll({
      pageIndex: 0,
      pageSize: 100,
      specialtyId,
    });

    if (firstPage.total <= firstPage.data.length) return firstPage.data;

    const items = [...firstPage.data];
    let pageIndex = 1;

    while (items.length < firstPage.total) {
      const next = await this.getAll({ pageIndex, pageSize: 100, specialtyId });

      if (!next.data?.length) break;

      items.push(...next.data);
      pageIndex += 1;
    }

    return items;
  },

  async create(payload) {
    const { data } = await axiosInstance.post('/api/doctors', payload);

    return data;
  },

  async update(id, payload) {
    const { data } = await axiosInstance.put(`/api/doctors/${id}`, payload);

    return data;
  },

  async remove(id) {
    await axiosInstance.delete(`/api/doctors/${id}`);
  },
};
