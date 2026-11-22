import { createContext, useCallback, useMemo, useState } from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';
import { ROLES } from '../constants';
import { clearCache } from '../../shared/api/cache';
import { getTokenRole, isTokenValid } from '../services/token';
import {
  SESSION_FIELDS,
  clearSession,
  readSession,
  saveSession,
} from '../services/sessionStorage';

const SessionContext = createContext();
const ProfileContext = createContext();
const AuthActionsContext = createContext();

function AuthProvider({ children }) {
  // El rol y la vigencia salen del JWT: una key editable de localStorage no es una frontera de seguridad.
  const [initialSession] = useState(() => {
    const token = readSession(SESSION_FIELDS.TOKEN);
    const valid = isTokenValid(token);

    if (token && !valid) {
      clearSession();
    }

    return {
      isAuthenticated: valid,
      role: valid ? getTokenRole(token) : null,
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    initialSession.isAuthenticated
  );

  const [role, setRole] = useState(initialSession.role);
  const [email, setEmail] = useState(() => readSession(SESSION_FIELDS.EMAIL));
  const [dni, setDni] = useState(() => readSession(SESSION_FIELDS.DNI));

  const singout = useCallback(() => {
    clearSession();
    clearCache();

    setIsAuthenticated(false);
    setRole(null);
    setEmail(null);
    setDni(null);
  }, []);

  const setAuthSession = useCallback((token, userRole, userData = null) => {
    clearCache();
    saveSession(SESSION_FIELDS.TOKEN, token);

    const sessionRole = getTokenRole(token) ?? userRole ?? null;
    const sessionEmail = userData?.email?.trim() || null;

    const sessionDni =
      sessionRole === ROLES.PATIENT && userData?.dni != null
        ? String(userData.dni)
        : null;

    saveSession(SESSION_FIELDS.EMAIL, sessionEmail);
    saveSession(SESSION_FIELDS.DNI, sessionDni);

    setRole(sessionRole);
    setEmail(sessionEmail);
    setDni(sessionDni);
    setIsAuthenticated(isTokenValid(token));
  }, []);

  const singinAdmin = useCallback(
    async (email, password) => {
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
    },
    [setAuthSession]
  );

  const singinPatient = useCallback(
    async ({ email, dni, firstName, lastName }) => {
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
    },
    [setAuthSession]
  );

  // Cada rebanada se memoiza por separado: cambiar el perfil no re-renderiza a quien solo mira la sesión.
  const session = useMemo(
    () => ({ isAuthenticated, role }),
    [isAuthenticated, role]
  );

  const profile = useMemo(() => ({ email, dni }), [email, dni]);

  const actions = useMemo(
    () => ({ singinAdmin, singinPatient, singout, setAuthSession }),
    [singinAdmin, singinPatient, singout, setAuthSession]
  );

  return (
    <SessionContext.Provider value={session}>
      <ProfileContext.Provider value={profile}>
        <AuthActionsContext.Provider value={actions}>
          {children}
        </AuthActionsContext.Provider>
      </ProfileContext.Provider>
    </SessionContext.Provider>
  );
}

export { AuthProvider, SessionContext, ProfileContext, AuthActionsContext };
