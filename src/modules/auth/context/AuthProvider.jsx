import { createContext, useState } from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';

const SessionContext = createContext();
const ProfileContext = createContext();
const AuthActionsContext = createContext();

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');

    return Boolean(token);
  });

  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [email, setEmail] = useState(() => localStorage.getItem('email'));
  const [dni, setDni] = useState(() => localStorage.getItem('dni'));

  const singout = () => {
    ['token', 'role', 'dni', 'email'].forEach((key) => {
      localStorage.removeItem(key);
    });

    setIsAuthenticated(false);
    setRole(null);
    setEmail(null);
    setDni(null);
  };

  const setAuthSession = (token, userRole, userData = null) => {
    localStorage.setItem('token', token);

    if (userRole) {
      localStorage.setItem('role', userRole);
    }

    const sessionEmail = userData?.email?.trim() || null;

    const sessionDni =
      userRole === 'PACIENTE' && userData?.dni != null
        ? String(userData.dni)
        : null;

    if (sessionEmail) {
      localStorage.setItem('email', sessionEmail);
    } else {
      localStorage.removeItem('email');
    }

    if (sessionDni) {
      localStorage.setItem('dni', sessionDni);
    } else {
      localStorage.removeItem('dni');
    }

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

    if (!data?.token || data.role !== 'ADMINISTRADOR') {
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

    if (!data?.token || data.role !== 'PACIENTE') {
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
    <SessionContext.Provider value={{ isAuthenticated, role }}>
      <ProfileContext.Provider value={{ email, dni }}>
        <AuthActionsContext.Provider
          value={{ singinAdmin, singinPatient, singout, setAuthSession }}
        >
          {children}
        </AuthActionsContext.Provider>
      </ProfileContext.Provider>
    </SessionContext.Provider>
  );
}

export { AuthProvider, SessionContext, ProfileContext, AuthActionsContext };
