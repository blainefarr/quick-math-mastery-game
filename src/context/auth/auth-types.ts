
import { ReactNode } from "react";

export interface AuthContextType {
  isLoggedIn: boolean;
  username: string;
  userId: string | null;
  handleLogout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}
