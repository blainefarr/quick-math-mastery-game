
import { ReactNode } from 'react';

export interface AuthStateType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId: string | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  hasMultipleProfiles: boolean;
  isNewSignup: boolean;
  retryAttempts: number;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  setUserId: (userId: string | null) => void;
  setDefaultProfileId: (profileId: string | null) => void;
  setIsLoadingProfile: (isLoading: boolean) => void;
  setHasMultipleProfiles: (hasMultiple: boolean) => void;
  setIsNewSignup: (isNew: boolean) => void;
  setRetryAttempts: (attempts: number | ((prev: number) => number)) => void;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId: string | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  hasMultipleProfiles: boolean;
  isNewSignup: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  setDefaultProfileId: (profileId: string) => void;
  handleLogout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
