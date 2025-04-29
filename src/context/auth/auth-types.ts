
export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId: string | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  isReady: boolean;
  authError: string | null; // New error state to communicate auth issues
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  setDefaultProfileId: (profileId: string) => void;
  handleLogout: () => Promise<void>;
  resetAuthError: () => void; // Function to reset error state after user takes action
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
