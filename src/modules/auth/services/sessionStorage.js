export const SESSION_FIELDS = {
  TOKEN: 'token',
  DNI: 'dni',
  EMAIL: 'email',
};

const SESSION_KEYS = Object.values(SESSION_FIELDS);

export const readSession = (field) => localStorage.getItem(field);

export const saveSession = (field, value) => {
  if (value) {
    localStorage.setItem(field, value);
  } else {
    localStorage.removeItem(field);
  }
};

export const clearSession = () => {
  SESSION_KEYS.forEach((field) => localStorage.removeItem(field));
};
