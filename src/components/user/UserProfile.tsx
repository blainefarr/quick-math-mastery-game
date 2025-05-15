
import React, { useEffect, useState, memo } from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileSwitcherDialog } from './ProfileSwitcherDialog';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import logger from '@/utils/logger';

const PROFILE_SWITCHER_SHOWN_KEY = 'math_game_profile_switcher_shown';

// Memoized component to prevent unnecessary re-renders
const UserProfile = () => {
  const { 
    username, 
    isAuthenticated, 
    isLoadingProfile, 
    hasMultipleProfiles,
    defaultProfileId,
    isNewSignup,
    userId,
    handleLogout
  } = useAuth();
  
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [profilesChecked, setProfilesChecked] = useState(false);
  const [isForceLogout, setIsForceLogout] = useState(false);
  const [autoLogoutTimer, setAutoLogoutTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Check if we need to show the profile switcher when user has multiple profiles
  useEffect(() => {
    // Don't show anything during initial load or for new signups that are being processed
    if (!isAuthenticated || isLoadingProfile || isNewSignup) {
      logger.debug('Not showing profile switcher yet: still loading or new signup', 'profiles');
      return;
    }
    
    // Only show profile switcher once after login when user has multiple profiles
    if (hasMultipleProfiles && defaultProfileId) {
      const hasShownSwitcherForSession = sessionStorage.getItem(PROFILE_SWITCHER_SHOWN_KEY) === 'true';
      
      if (!hasShownSwitcherForSession) {
        logger.debug('Multiple profiles detected, showing picker once after login', 'profiles');
        setShowProfileSwitcher(true);
        // Mark that we've shown the switcher for this session
        sessionStorage.setItem(PROFILE_SWITCHER_SHOWN_KEY, 'true');
      } else {
        logger.debug('Multiple profiles detected, but already shown for this session', 'profiles');
      }
      
      setProfilesChecked(true);
    } else if (!profilesChecked) {
      // Single profile - just mark as checked to prevent further checks
      setProfilesChecked(true);
    }
  }, [isAuthenticated, isLoadingProfile, hasMultipleProfiles, isNewSignup, profilesChecked, defaultProfileId]);
  
  // Handle failed profile loading - Automatically log out user if no profile is found
  useEffect(() => {
    // Clear any existing timer when dependencies change
    if (autoLogoutTimer) {
      clearTimeout(autoLogoutTimer);
      setAutoLogoutTimer(null);
    }

    // Only setup the timer if we've completed authentication and loading state
    if (isAuthenticated && !isLoadingProfile && !defaultProfileId && !isNewSignup && !isForceLogout) {
      logger.warn('No profile loaded, will wait 8 seconds before logging out');
      
      // Set a timer to wait before logging out
      const timer = setTimeout(() => {
        // Check again if profile loaded during the delay
        if (!defaultProfileId) {
          logger.error('No profile loaded after delay, forcing logout');
          setIsForceLogout(true);
          
          // Show a message and force logout
          toast({
            title: "Profile loading failed",
            description: "Signing you out for security reasons.",
            variant: "destructive"
          });
          
          setTimeout(() => {
            handleLogout();
          }, 2000);
        }
      }, 8000); // 8 second delay before forcing logout
      
      setAutoLogoutTimer(timer);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (autoLogoutTimer) {
        clearTimeout(autoLogoutTimer);
      }
    };
  }, [isAuthenticated, isLoadingProfile, defaultProfileId, isNewSignup, handleLogout, isForceLogout]);
  
  // Clear the profile switcher shown flag when the user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.removeItem(PROFILE_SWITCHER_SHOWN_KEY);
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    logger.debug('Not authenticated, returning null', 'profiles');
    return null;
  }
  
  if (isNewSignup) {
    logger.debug('New signup in progress, showing setup message', 'profiles');
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
    logger.debug('Profile loading, showing skeleton', 'profiles');
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    );
  }
  
  // Extra validation - only render dropdown if we have a valid profile
  if (!defaultProfileId) {
    logger.debug('No default profile ID, showing loading message', 'profiles');
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2 border px-3 py-1 rounded-full">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }
  
  logger.debug('Rendering dropdown with username: ' + username, 'profiles');
  return (
    <div className="flex items-center gap-2">
      <UserDropdown 
        username={username || 'User'} 
        hasMultipleProfiles={hasMultipleProfiles}
      />
      
      {/* Profile Switcher Dialog */}
      <ProfileSwitcherDialog 
        open={showProfileSwitcher} 
        onOpenChange={setShowProfileSwitcher} 
      />
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default memo(UserProfile);
