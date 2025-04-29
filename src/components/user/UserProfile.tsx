
import React, { useEffect, useState } from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileSwitcherDialog } from './ProfileSwitcherDialog';

const UserProfile = () => {
  const { 
    username, 
    isAuthenticated, 
    isLoadingProfile, 
    hasMultipleProfiles 
  } = useAuth();
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  
  // Auto-show profile switcher when user has multiple profiles and no active profile selected
  useEffect(() => {
    // Only show automatically if we're not loading and have multiple profiles
    if (!isLoadingProfile && hasMultipleProfiles) {
      setShowProfileSwitcher(true);
    }
  }, [isLoadingProfile, hasMultipleProfiles]);
  
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
      
      {/* Profile Switcher Dialog */}
      <ProfileSwitcherDialog 
        open={showProfileSwitcher} 
        onOpenChange={setShowProfileSwitcher} 
      />
    </div>
  );
};

export default UserProfile;
