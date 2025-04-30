
import React, { useEffect, useState } from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileSwitcherDialog } from './ProfileSwitcherDialog';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PROFILE_SWITCHER_SHOWN_KEY = 'math_game_profile_switcher_shown';

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
      console.log('UserProfile: Not showing profile switcher yet: still loading or new signup');
      return;
    }
    
    // Only show profile switcher once after login when user has multiple profiles
    if (hasMultipleProfiles && defaultProfileId) {
      const hasShownSwitcherForSession = sessionStorage.getItem(PROFILE_SWITCHER_SHOWN_KEY) === 'true';
      
      if (!hasShownSwitcherForSession) {
        console.log('UserProfile: Multiple profiles detected, showing picker once after login');
        setShowProfileSwitcher(true);
        // Mark that we've shown the switcher for this session
        sessionStorage.setItem(PROFILE_SWITCHER_SHOWN_KEY, 'true');
      } else {
        console.log('UserProfile: Multiple profiles detected, but already shown for this session');
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
      console.log('UserProfile: No profile loaded, will wait 3 seconds before logging out');
      
      // Set a timer to wait before logging out
      const timer = setTimeout(() => {
        // Check again if profile loaded during the delay
        if (!defaultProfileId) {
          console.log('UserProfile: No profile loaded after delay, forcing logout');
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
      }, 3000); // 3 second delay before forcing logout
      
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
  
  // Debug user state
  useEffect(() => {
    if (isAuthenticated) {
      console.log('UserProfile: Current state:', {
        userId,
        username,
        defaultProfileId,
        isLoadingProfile,
        hasMultipleProfiles,
        isNewSignup,
        showProfileSwitcher,
        profilesChecked,
        renderDecision: isNewSignup ? "showing setup message" :
                       isLoadingProfile ? "showing skeleton" :
                       !defaultProfileId ? "showing loading message" :
                       "showing dropdown"
      });
    }
  }, [isAuthenticated, userId, username, defaultProfileId, isLoadingProfile, hasMultipleProfiles, isNewSignup, showProfileSwitcher, profilesChecked]);
  
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

export default UserProfile;
