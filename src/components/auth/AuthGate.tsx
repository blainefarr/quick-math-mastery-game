
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthGate controls access to routes based on authentication state
 * If requireAuth is true, will redirect to login if not authenticated
 * If requireAuth is false, will redirect to home if already authenticated
 */
const AuthGate = ({ children, requireAuth = true }: AuthGateProps) => {
  const { 
    isAuthenticated, 
    isLoadingProfile,
    defaultProfileId,
    authError
  } = useAuth();
  const location = useLocation();
  const [authTimeoutReached, setAuthTimeoutReached] = React.useState(false);
  
  // Set a timeout for authentication loading
  React.useEffect(() => {
    if (isLoadingProfile) {
      const timeoutId = setTimeout(() => {
        setAuthTimeoutReached(true);
        toast.error('Having trouble loading your profile. Please try logging in again.');
      }, 8000); // 8 second timeout
      
      return () => clearTimeout(timeoutId);
    } else {
      setAuthTimeoutReached(false);
    }
  }, [isLoadingProfile]);
  
  // Show auth error if present
  React.useEffect(() => {
    if (authError) {
      toast.error(`Authentication error: ${authError}`);
    }
  }, [authError]);

  // If we're still loading, show loading state
  if (isLoadingProfile && !authTimeoutReached) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-xl font-medium text-primary">Loading your profile...</p>
      </div>
    );
  }

  // Handle authentication requirements
  if (requireAuth) {
    // Require both authentication and a valid profile ID to access protected routes
    const isFullyAuthenticated = isAuthenticated && !!defaultProfileId;
    
    // If authentication failed or timed out
    if (!isFullyAuthenticated && (authTimeoutReached || !isLoadingProfile)) {
      // Redirect to login, but save the attempted path for redirect after login
      return <Navigate to="/" state={{ from: location.pathname }} replace />;
    }
  } else if (isAuthenticated) {
    // If route doesn't require auth but user is logged in (like login page)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGate;
