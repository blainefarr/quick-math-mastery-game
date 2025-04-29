
export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId: string | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean;
  isReady: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  setDefaultProfileId: (profileId: string) => void;
  handleLogout: () => Promise<boolean>; // Changed from Promise<void> to Promise<boolean>
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
