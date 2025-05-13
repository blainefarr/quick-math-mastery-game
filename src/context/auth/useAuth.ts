
// This is a barrel file to re-export the hook and provider for easier imports
import useAuthHook from './useAuth.tsx';
import { AuthProvider } from './useAuth.tsx';

export { AuthProvider };
export const useAuth = useAuthHook;
export default useAuthHook;
