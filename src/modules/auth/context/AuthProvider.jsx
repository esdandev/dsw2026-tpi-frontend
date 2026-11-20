import { createContext, useState } from 'react';
import { login } from '../services/login';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');

    return Boolean(token);
  });

  const [role, setRole] = useState(() => localStorage.getItem('role'));

  const singout = () => {
    ['token', 'role', 'dni', 'email'].forEach((key) => {
      localStorage.removeItem(key);
    });

    setIsAuthenticated(false);
    setRole(null);
  };

  const setAuthSession = (token, userRole, patientData = null) => {
    localStorage.setItem('token', token);

    if (userRole) {
      localStorage.setItem('role', userRole);
    }

    if (userRole === 'ADMINISTRADOR') {
      localStorage.removeItem('dni');
      localStorage.removeItem('email');
    }

    if (userRole === 'PACIENTE' && patientData) {
      localStorage.setItem('dni', String(patientData.dni));
      localStorage.setItem('email', patientData.email);
    }

    setRole(userRole || null);
    setIsAuthenticated(true);
  };

  const singin = async (username, password) => {
    const { data, error } = await login(username, password);

    if (error) {
      return { error };
    }

    setAuthSession(data);

    return { error: null };
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

    setAuthSession(data.token, data.role);

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
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        singin,
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
