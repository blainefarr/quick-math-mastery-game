
// This file is kept only to avoid breaking existing imports
// All functionality is now in AuthProvider.tsx
// Import the actual functionality from there

import { useAuth } from './AuthProvider';
import AuthProvider from './AuthProvider';

export { useAuth, AuthProvider };
export default useAuth;
