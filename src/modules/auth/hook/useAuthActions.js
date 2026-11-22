import { useContext } from 'react';
import { AuthActionsContext } from '../context/AuthProvider';

const useAuthActions = () => {
  const actions = useContext(AuthActionsContext);

  if (!actions) {
    throw new Error(
      'useAuthActions no debe ser usado por fuera de AuthProvider'
    );
  }

  return actions;
};

export default useAuthActions;
