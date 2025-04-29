
export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId: string | null;
  isLoadingProfile: boolean;
  isAuthenticated: boolean;
  authError: string | null; // Add authentication error tracking
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  setDefaultProfileId: (profileId: string | null) => void;
  handleLogout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
