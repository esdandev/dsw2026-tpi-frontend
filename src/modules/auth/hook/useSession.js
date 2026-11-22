import { useContext } from 'react';
import { SessionContext } from '../context/AuthProvider';

const useSession = () => {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error('useSession no debe ser usado por fuera de AuthProvider');
  }

  return session;
};

export default useSession;
