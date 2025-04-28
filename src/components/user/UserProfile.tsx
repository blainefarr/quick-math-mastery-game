
import React from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';

const UserProfile = () => {
  const { username, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2">
      <UserDropdown username={username || 'User'} />
    </div>
  );
};

export default UserProfile;
