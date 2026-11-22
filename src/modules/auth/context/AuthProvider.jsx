import { createContext, useState } from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';
import { ROLES } from '../constants';
import {
  SESSION_FIELDS,
  clearSession,
  readSession,
  saveSession,
} from '../services/sessionStorage';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(readSession(SESSION_FIELDS.TOKEN))
  );

  const [role, setRole] = useState(() => readSession(SESSION_FIELDS.ROLE));
  const [email, setEmail] = useState(() => readSession(SESSION_FIELDS.EMAIL));
  const [dni, setDni] = useState(() => readSession(SESSION_FIELDS.DNI));

  const singout = () => {
    clearSession();

    setIsAuthenticated(false);
    setRole(null);
    setEmail(null);
    setDni(null);
  };

  const setAuthSession = (token, userRole, userData = null) => {
    saveSession(SESSION_FIELDS.TOKEN, token);
    saveSession(SESSION_FIELDS.ROLE, userRole);

    const sessionEmail = userData?.email?.trim() || null;

    const sessionDni =
      userRole === ROLES.PATIENT && userData?.dni != null
        ? String(userData.dni)
        : null;

    saveSession(SESSION_FIELDS.EMAIL, sessionEmail);
    saveSession(SESSION_FIELDS.DNI, sessionDni);

    setRole(userRole || null);
    setEmail(sessionEmail);
    setDni(sessionDni);
    setIsAuthenticated(true);
  };

  const singinAdmin = async (email, password) => {
    const { data, error } = await loginAdmin(email, password);

    if (error) {
      return { error };
    }

    if (!data?.token || data.role !== ROLES.ADMIN) {
      return {
        error: {
          frontendErrorMessage:
            'Respuesta de autenticación administrativa inválida',
        },
      };
    }

    setAuthSession(data.token, data.role, { email });

    return { error: null };
  };

  const singinPatient = async ({ email, dni, firstName, lastName }) => {
    const { data, error } = await loginPatient({
      email,
      dni,
      firstName,
      lastName,
    });

    if (error) {
      return { error };
    }

    if (!data?.token || data.role !== ROLES.PATIENT) {
      return {
        error: {
          frontendErrorMessage:
            'Respuesta de autenticación del paciente inválida',
        },
      };
    }

    setAuthSession(data.token, data.role, { email, dni });

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        email,
        dni,
        singinAdmin,
        singinPatient,
        singout,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };
