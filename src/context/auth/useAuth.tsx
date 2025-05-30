
import { useContext } from 'react';
import AuthContext from './AuthContext';
import { AuthContextType } from './auth-types';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
