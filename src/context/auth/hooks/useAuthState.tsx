
import { useState } from 'react';
import { AuthStateType } from '../auth-types';

export const useAuthState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasMultipleProfiles, setHasMultipleProfiles] = useState(false);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const authState: AuthStateType = {
    isLoggedIn,
    username,
    userId,
    defaultProfileId,
    isAuthenticated: isLoggedIn,
    isLoadingProfile,
    hasMultipleProfiles,
    isNewSignup,
    retryAttempts,
    setIsLoggedIn,
    setUsername,
    setUserId,
    setDefaultProfileId,
    setIsLoadingProfile,
    setHasMultipleProfiles,
    setIsNewSignup,
    setRetryAttempts
  };

  return authState;
};
