
export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId: string | null;
  isAuthenticated: boolean;
  isLoadingProfile: boolean; // Add this state to track profile loading
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  handleLogout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
