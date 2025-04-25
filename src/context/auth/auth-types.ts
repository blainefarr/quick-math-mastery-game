
import { ReactNode } from "react";

export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  setIsLoggedIn: (value: boolean) => void;
  setUsername: (name: string) => void;
  handleLogout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
