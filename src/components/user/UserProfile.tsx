
import React from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

const UserProfile = () => {
  const { username, isAuthenticated, isLoadingProfile, isReady } = useAuth();
  
  if (!isReady) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (isLoadingProfile) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <UserDropdown username={username || 'User'} />
    </div>
  );
};

export default UserProfile;
