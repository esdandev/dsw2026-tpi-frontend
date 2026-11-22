import { useContext } from 'react';
import { ProfileContext } from '../context/AuthProvider';

const useProfile = () => {
  const profile = useContext(ProfileContext);

  if (!profile) {
    throw new Error('useProfile no debe ser usado por fuera de AuthProvider');
  }

  return profile;
};

export default useProfile;
