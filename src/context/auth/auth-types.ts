
export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  defaultProfileId?: string | null;
  isAuthenticated: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  handleLogout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}
