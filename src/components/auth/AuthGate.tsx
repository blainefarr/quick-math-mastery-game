
import React from 'react';
import { useAuth } from '@/context/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  const { isAuthenticated, isReady, isLoggedIn, defaultProfileId, isLoadingProfile, handleLogout } = useAuth();
  const navigate = useNavigate();

  // If authentication is still initializing, show loading state
  if (!isReady) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center">
        <div className="space-y-2 w-full max-w-md">
          <Skeleton className="h-6 w-2/3 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Initializing app...
          </div>
        </div>
      </Card>
    );
  }

  // If authentication is required but user is not authenticated, handle accordingly
  if (requireAuth && !isAuthenticated) {
    // Check for partial authentication state (logged in but no profile)
    if (isLoggedIn && !defaultProfileId) {
      return (
        <Alert variant="destructive" className="mb-4 max-w-md mx-auto mt-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>Your profile couldn't be loaded. This can happen due to a network issue or account setup problem.</p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  navigate('/');
                  window.location.reload(); // Force a refresh to retry
                }}
              >
                Retry
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={async () => {
                  const success = await handleLogout();
                  if (success) {
                    toast.success("You've been logged out. Please try logging in again.");
                    navigate('/');
                  }
                }}
              >
                Log Out and Try Again
              </Button>
            </div>
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
    }, 100);
    
    return null;
  }

  // If we're authenticated or auth is not required, render the children
  return <>{children}</>;
};

export default AuthGate;
