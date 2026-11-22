import { useContext } from 'react';
import {
  AuthActionsContext,
  ProfileContext,
  SessionContext,
} from '../context/AuthProvider';

const useAuth = () => {
  const session = useContext(SessionContext);
  const profile = useContext(ProfileContext);
  const actions = useContext(AuthActionsContext);

  if (!session || !profile || !actions) {
    throw new Error('useAuth no debe ser usado por fuera de AuthProvider');
  }

  return { ...session, ...profile, ...actions };
};

export default useAuth;
