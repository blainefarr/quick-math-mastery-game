
import React, { useEffect, useState } from 'react';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/context/auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileSwitcherDialog } from './ProfileSwitcherDialog';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [profilesChecked, setProfilesChecked] = useState(false);
  
  // Check if we need to show the profile switcher when user has multiple profiles
  useEffect(() => {
    // Don't show anything during initial load or for new signups that are being processed
    if (!isAuthenticated || isLoadingProfile || isNewSignup) {
      console.log('UserProfile: Not showing profile switcher yet: still loading or new signup');
      return;
    }
    
    // User is authenticated and profile loading is complete
    if (hasMultipleProfiles && !profilesChecked) {
      console.log('UserProfile: Multiple profiles detected, checking if we need to show picker');
      
      // Check if user has an active profile set
      const checkActiveProfile = async () => {
        try {
          // Get the currently active profile
          const activeProfileId = localStorage.getItem('math_game_active_profile');
          
          if (!activeProfileId) {
            console.log('UserProfile: No active profile found with multiple profiles, showing selector');
            setShowProfileSwitcher(true);
          } else {
            console.log('UserProfile: Active profile found:', activeProfileId);
          }
        } catch (error) {
          console.error('Error checking profiles:', error);
        } finally {
          setProfilesChecked(true);
        }
      };
      
      checkActiveProfile();
    } else if (!profilesChecked) {
      // Single profile - just mark as checked to prevent further checks
      setProfilesChecked(true);
    }
  }, [isAuthenticated, isLoadingProfile, hasMultipleProfiles, defaultProfileId, isNewSignup, profilesChecked]);
  
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
