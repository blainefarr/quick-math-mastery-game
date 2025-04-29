
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
    if (shouldShowProfileSelector && isAuthenticated && !isLoadingProfile) {
      console.log("Auto-opening profile switcher");
      // The dialog is now controlled by the open prop, no need for additional code
    }
  }, [shouldShowProfileSelector, isAuthenticated, isLoadingProfile]);
  
  // Show loading state when profile is loading or auth is not ready
  if (isLoadingProfile || !isReady) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    );
  }
  
  // Don't show anything for unauthenticated users
  if (!isAuthenticated) {
    return null;
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
