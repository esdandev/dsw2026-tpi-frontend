export const ROLES = {
  ADMIN: 'ADMINISTRADOR',
  PATIENT: 'PACIENTE',
};

export const HOME_BY_ROLE = {
  [ROLES.ADMIN]: '/admin/home',
  [ROLES.PATIENT]: '/',
};
