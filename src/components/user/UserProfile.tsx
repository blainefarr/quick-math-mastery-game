
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';

const UserProfile = () => {
  const { username, userId } = useAuth();
  const [initials, setInitials] = useState('');

  useEffect(() => {
    if (username) {
      const nameParts = username.split(' ');
      const initial = nameParts.map(part => part[0]?.toUpperCase() || '').join('');
      setInitials(initial.substring(0, 2));
    }
  }, [username]);

  return (
    <div className="flex items-center gap-2">
      <UserDropdown username={username || 'User'} />
      
      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
        <AvatarFallback className="text-xs font-semibold">
          {initials || 'U'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserProfile;
