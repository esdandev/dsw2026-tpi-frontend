import { instance } from '../../shared/api/axiosInstance';

export async function getPatientAppointments(dni) {
  const { data } = await instance.get('/api/appointments/patient', {
    params: { dni },
  });

  return data;
}

export async function cancelPatientAppointment(id) {
  await instance.delete(`/api/appointments/${id}`);
}
