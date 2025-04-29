
import React, { useEffect, useState } from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileSwitcherDialog } from './ProfileSwitcherDialog';
import { Loader2 } from 'lucide-react';

const UserProfile = () => {
  const { 
    username, 
    isAuthenticated, 
    isLoadingProfile, 
    hasMultipleProfiles,
    defaultProfileId,
    isNewSignup,
    userId
  } = useAuth();
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  
  // Auto-show profile switcher when user has multiple profiles or no active profile selected
  useEffect(() => {
    // Don't show anything during initial load or for new signups that are being processed
    if (isLoadingProfile || isNewSignup) {
      console.log('UserProfile: Not showing profile switcher yet: still loading or new signup');
      return;
    }
    
    // Only show automatically if we have multiple profiles and no recent showings
    if (hasMultipleProfiles && defaultProfileId) {
      console.log('UserProfile: Auto-showing profile switcher: multiple profiles detected');
      setShowProfileSwitcher(true);
    } 
    // Only show if we've completed loading and there's no profile
    else if (!defaultProfileId && !isNewSignup) {
      console.log('UserProfile: Auto-showing profile switcher: no active profile');
      setShowProfileSwitcher(true);
    }
  }, [isLoadingProfile, hasMultipleProfiles, defaultProfileId, isNewSignup]);
  
  // Debug user state
  useEffect(() => {
    if (isAuthenticated) {
      console.log('UserProfile: Current state:', {
        userId,
        username,
        defaultProfileId,
        isLoadingProfile,
        hasMultipleProfiles,
        isNewSignup
      });
    }
  }, [isAuthenticated, userId, username, defaultProfileId, isLoadingProfile, hasMultipleProfiles, isNewSignup]);
  
  if (!isAuthenticated) {
    console.log('UserProfile: Not authenticated, returning null');
    return null;
  }
  
  if (isNewSignup) {
    console.log('UserProfile: New signup in progress, showing setup message');
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2 border px-3 py-1 rounded-full">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Setting up account...</span>
        </div>
      </div>
    );
  }
  
  if (isLoadingProfile) {
    console.log('UserProfile: Profile loading, showing skeleton');
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    );
  }
  
  // Extra validation - only render dropdown if we have a valid profile
  if (!defaultProfileId) {
    console.log('UserProfile: No default profile ID, showing loading message');
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2 border px-3 py-1 rounded-full">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }
  
  console.log('UserProfile: Rendering dropdown with username:', username);
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
