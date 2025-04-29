
import React from 'react';
import { useAuth } from '@/context/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean; // Whether authentication is required for this route
}

/**
 * AuthGate component that controls access to protected routes
 * If requireAuth is true, it will redirect to login if not authenticated
 * It will show a loading state while authentication is being determined
 */
export const AuthGate = ({ 
  children, 
  requireAuth = false 
}: AuthGateProps) => {
  const { isAuthenticated, isReady, isLoggedIn, defaultProfileId, isLoadingProfile } = useAuth();
  const navigate = useNavigate();

  // If authentication is still initializing, show loading state
  if (!isReady) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center">
        <div className="space-y-2 w-full max-w-md">
          <Skeleton className="h-6 w-2/3 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </div>
      </Card>
    );
  }

  // If authentication is required but user is not authenticated, redirect to home
  if (requireAuth && !isAuthenticated) {
    // Check for partial authentication state (logged in but no profile)
    if (isLoggedIn && !defaultProfileId) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            We couldn't load your profile. Please try logging out and back in again.
          </AlertDescription>
        </Alert>
      );
    }
    
    if (isLoadingProfile) {
      return (
        <Card className="p-8 flex flex-col items-center justify-center">
          <div className="space-y-2 w-full max-w-md">
            <Skeleton className="h-6 w-2/3 mx-auto" />
            <Skeleton className="h-32 w-full" />
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Loading your profile...
            </div>
          </div>
        </Card>
      );
    }
    
    // Use a timeout to avoid immediate redirects which can cause UI flicker
    setTimeout(() => {
      navigate('/');
    }, 0);
    
    return null;
  }

  // If we're authenticated or auth is not required, render the children
  return <>{children}</>;
};

export default AuthGate;
