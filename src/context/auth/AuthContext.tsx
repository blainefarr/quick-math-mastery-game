
import React from 'react';
import { AuthContextType } from './auth-types';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
