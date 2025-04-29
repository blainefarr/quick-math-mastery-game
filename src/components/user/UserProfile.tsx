
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
    isNewSignup
  } = useAuth();
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  
  // Auto-show profile switcher when user has multiple profiles or no active profile selected
  useEffect(() => {
    // Don't show anything during initial load or for new signups that are being processed
    if (isLoadingProfile || isNewSignup) {
      return;
    }
    
    // Only show automatically if we have multiple profiles and no recent showings
    if (hasMultipleProfiles && defaultProfileId) {
      console.log('Auto-showing profile switcher: multiple profiles detected');
      setShowProfileSwitcher(true);
    } 
    // Only show if we've completed loading and there's no profile
    else if (!defaultProfileId && !isNewSignup) {
      console.log('Auto-showing profile switcher: no active profile');
      setShowProfileSwitcher(true);
    }
  }, [isLoadingProfile, hasMultipleProfiles, defaultProfileId, isNewSignup]);
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (isNewSignup) {
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
