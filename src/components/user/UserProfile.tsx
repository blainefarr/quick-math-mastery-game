
import React, { useEffect } from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileSwitcherDialog } from './ProfileSwitcherDialog';

const UserProfile = () => {
  const { 
    username, 
    isAuthenticated, 
    isLoadingProfile, 
    isReady, 
    shouldShowProfileSelector,
    setShouldShowProfileSelector 
  } = useAuth();
  
  // Open profile switcher when shouldShowProfileSelector is true
  useEffect(() => {
    // Small delay to ensure UI is ready
    if (shouldShowProfileSelector && isAuthenticated && !isLoadingProfile) {
      console.log("Auto-opening profile switcher");
    }
  }, [shouldShowProfileSelector, isAuthenticated, isLoadingProfile]);
  
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
      
      {/* Always render the dialog but control visibility with the open prop */}
      <ProfileSwitcherDialog 
        open={shouldShowProfileSelector} 
        onOpenChange={setShouldShowProfileSelector}
      />
    </div>
  );
};

export default UserProfile;
