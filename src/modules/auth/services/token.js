const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export function decodeToken(token) {
  if (!token) return null;

  try {
    const payload = token.split('.')[1];

    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getTokenRole(token) {
  const payload = decodeToken(token);
  // El backend firma el rol como "Administrador"/"Paciente"; el front lo compara en mayúsculas.
  const role = payload?.role ?? payload?.[ROLE_CLAIM];

  return role ? String(role).toUpperCase() : null;
}

export function isTokenValid(token) {
  const payload = decodeToken(token);

  return Boolean(payload?.exp) && payload.exp * 1000 > Date.now();
}
