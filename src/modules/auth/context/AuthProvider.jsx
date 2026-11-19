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

  const setAuthSession = (token, userRole) => {
    localStorage.setItem('token', token);

    if (userRole) {
      localStorage.setItem('role', userRole);
    }

    if (userRole === 'ADMINISTRADOR') {
      localStorage.removeItem('dni');
      localStorage.removeItem('email');
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

  const singinPatient = async (username, password) => {
    if (
      (username === 'paciente' ||
        username === 'paciente@medportal.com' ||
        username === 'paciente@test.com') &&
      password === 'paciente123'
    ) {
      setAuthSession('mock-patient-token-67890');

      return { error: null };
    }

    const { data, error } = await loginPatient(username, password);

    if (error) {
      return { error };
    }

    setAuthSession(data);

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
