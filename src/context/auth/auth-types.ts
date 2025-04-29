
export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId: string | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  isReady: boolean;
  authError: string | null;
  shouldShowProfileSelector: boolean; // New state to indicate when to show profile selector
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  setDefaultProfileId: (profileId: string) => void;
  setShouldShowProfileSelector: (show: boolean) => void; // New setter for profile selector state
  handleLogout: () => Promise<void>;
  resetAuthError: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
