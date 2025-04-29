
import React from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

const UserProfile = () => {
  const { username, isAuthenticated, isLoadingProfile, authError } = useAuth();
  
  // If not authenticated, show nothing
  if (!isAuthenticated) {
    return null;
  }
  
  // Show skeleton during initial load
  if (isLoadingProfile && !username) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>
    );
  }
  
  // Show error state if there's an authentication error
  if (authError) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <Avatar className="h-8 w-8 border border-destructive bg-destructive/10">
          <AvatarFallback className="text-destructive text-xs">
            !
          </AvatarFallback>
        </Avatar>
        <span className="text-xs">Auth Error</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      {username ? (
        <UserDropdown username={username} />
      ) : (
        <div className="flex items-center gap-2 animate-pulse">
          <Avatar className="h-8 w-8 bg-primary/10">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
