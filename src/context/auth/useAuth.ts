
// This is a barrel file to re-export the hook and provider for easier imports
import useAuthHook from './AuthProvider';
import AuthProvider from './AuthProvider';

export { AuthProvider };
export const useAuth = useAuthHook;
export default useAuthHook;
