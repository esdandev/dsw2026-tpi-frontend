import { instance } from '../../shared/api/axiosInstance';

export const loginPatient = async ({ email, dni, firstName, lastName }) => {
  const response = await instance.post('api/auth/patient/login', {
    email: email.trim(),
    dni: Number(dni),
    firstName: firstName?.trim() || null,
    lastName: lastName?.trim() || null,
  });

  return { data: response.data, error: null };
};
