import { instance } from '../../shared/api/axiosInstance';

// Obtener médicos con paginación y búsqueda
export async function getDoctors(pageSize = 10, pageIndex = 0, name = '') {
  const { data } = await instance.get('/api/doctors', {
    params: {
      pageSize,
      pageIndex,
      name: name.trim(),
    },
  });

  return data;
}

export async function getSpecialtiesForDoctorForm() {
  const specialties = [];
  const pageSize = 100;
  let pageIndex = 0;
  let total = 0;

  do {
    const { data } = await instance.get('/api/specialties', {
      params: { pageSize, pageIndex },
    });

    const currentPage = data.data || [];

    specialties.push(...currentPage);
    total = data.total || 0;

    if (currentPage.length === 0) {
      break;
    }

    pageIndex += 1;
  } while (specialties.length < total);

  return specialties;
}

// Registrar un nuevo médico
export async function createDoctor(doctor) {
  const { data } = await instance.post('/api/doctors', {
    name: doctor.name.trim(),
    licenseNumber: doctor.licenseNumber.trim(),
    specialtyId: doctor.specialtyId,
  });

  return data;
}

// Eliminar un médico
export async function deleteDoctor(id) {
  await instance.delete(`/api/doctors/${id}`);
}
