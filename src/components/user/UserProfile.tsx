
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
    hasMultipleProfiles,
    defaultProfileId
  } = useAuth();
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  
  // Auto-show profile switcher when user has multiple profiles or no active profile selected
  useEffect(() => {
    // Only show automatically if we're not loading and either have multiple profiles or no profile
    if (!isLoadingProfile) {
      if (hasMultipleProfiles) {
        console.log('Auto-showing profile switcher: multiple profiles detected');
        setShowProfileSwitcher(true);
      } else if (!defaultProfileId) {
        console.log('Auto-showing profile switcher: no active profile');
        setShowProfileSwitcher(true);
      }
    }
  }, [isLoadingProfile, hasMultipleProfiles, defaultProfileId]);
  
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
