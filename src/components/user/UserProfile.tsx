
import React from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';

const UserProfile = () => {
  const { username, isAuthenticated, isLoadingProfile } = useAuth();
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (isLoadingProfile) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-full"></div>
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
