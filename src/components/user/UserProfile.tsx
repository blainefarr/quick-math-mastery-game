
import React from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const UserProfile = () => {
  const { username, isAuthenticated, isLoadingProfile } = useAuth();
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (isLoadingProfile && !username) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      {username ? (
        <UserDropdown username={username} />
      ) : (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              User
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
