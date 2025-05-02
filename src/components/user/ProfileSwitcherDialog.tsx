
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Plus, User, UserCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CreateProfileForm } from './CreateProfileForm';
import { ACTIVE_PROFILE_KEY } from '@/context/auth/utils/profileUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Profile {
  id: string;
  name: string;
  grade?: string;
  is_active: boolean;
  created_at: string;
  is_owner: boolean;
}

interface ProfileSwitcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSwitcherDialog({
  open,
  onOpenChange
}: ProfileSwitcherDialogProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const {
    userId,
    defaultProfileId,
    setDefaultProfileId,
    setUsername,
    refreshUserProfile,
    isNewSignup
  } = useAuth();

  // Handle auto-close when a profile is selected or for new signups
  useEffect(() => {
    if (!open) return;

    // Don't show dialog for new signups
    if (isNewSignup) {
      console.log('Not showing profile switcher: new signup in progress');
      onOpenChange(false);
      return;
    }
  }, [open, isNewSignup, onOpenChange]);

  // Extra cleanup effect to ensure no modal backdrop issues
  useEffect(() => {
    if (!open) {
      // Force cleanup of any potential leftover modal state when dialog closes
      setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.classList.remove('ReactModal__Body--open');

        // Remove any stray backdrops just in case
        const strayOverlays = document.querySelectorAll('[role="dialog"]');
        strayOverlays.forEach(el => {
          // Only remove if it's not an active dialog
          if (el.getAttribute('data-state') !== 'open') {
            const backdrop = el.parentElement?.querySelector('[data-radix-dialog-overlay]');
            if (backdrop) backdrop.remove();
          }
        });
      }, 200);
    }
  }, [open]);

  // Fetch all profiles for this account
  const fetchProfiles = async (): Promise<boolean> => {
    if (!userId) {
      console.error('Cannot fetch profiles: No user ID available');
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching profiles for user ID:', userId);

      // Get all profiles for this account sorted by creation time
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('account_id', userId).order('created_at', {
        ascending: true
      });

      // Get the active profile ID from localStorage
      const activeProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY) || defaultProfileId;
      
      console.log(`Found ${data.length} profiles, activeProfileId:`, activeProfileId);
      const processedProfiles = data.map(profile => ({
        ...profile,
        // Mark as active if it matches the active profile ID
        active: profile.id === activeProfileId
      }));
      setProfiles(processedProfiles);
      return true;
    } catch (err) {
      console.error('Error in profile fetch:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (open && userId) {
      fetchProfiles();
    }
  }, [open, userId]);

  // Switch to a different profile
  const handleSwitchProfile = async (profile: Profile) => {
    try {
      console.log('Switching to profile:', profile.id, profile.name);

      // Update the local state
      setDefaultProfileId(profile.id);
      setUsername(profile.name || 'User');

      // Store the active profile ID in localStorage
      localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);

      // Show success message
      toast({
        title: "Profile switched",
        description: `Switched to ${profile.name}`
      });

      // Refresh user profile in the auth context
      await refreshUserProfile();

      // Close the dialog and ensure cleanup - fix for issue #1
      onOpenChange(false);

      // Extra cleanup to ensure no modal backdrop issues
      setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
        document.body.classList.remove('ReactModal__Body--open');
      }, 100);
    } catch (err) {
      console.error('Error switching profile:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to switch profile"
      });
    }
  };

  // Handle profile creation success
  const handleProfileCreated = async (newProfile: Profile) => {
    setShowCreateForm(false);
    await fetchProfiles();
    await handleSwitchProfile(newProfile);
  };
  
  const handleDialogChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.overflow = '';
      }, 50);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open && !isNewSignup} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[90vw] p-0 overflow-hidden z-50">
        <DialogHeader className="p-6 pb-0 py-[16px]">
          <DialogTitle className="text-2xl">Choose a Profile</DialogTitle>
          <DialogDescription>
            Select a profile or create a new one
          </DialogDescription>
        </DialogHeader>
        
        {!isLoading && profiles.length === 0 ? (
          <div className="p-6">
             <CreateProfileForm
              onSuccess={handleProfileCreated} 
              onCancel={() => fetchProfiles()}
              />
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground text-sm">Loading profiles...</p>
          </div>
        ) : (
          <ScrollArea className="h-[60vh] md:h-auto px-6">
              <div className="p-6 pt-0 px-[0px] my-[8px]">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 px-[4px]">
                  {profiles.map(profile => (
                    <Card 
                      key={profile.id}
                      onClick={() => handleSwitchProfile(profile)}
                      className={`p-3 sm:p-4 flex flex-col items-center cursor-pointer transition-all hover:border-primary ${profile.id === defaultProfileId ? 'ring-2 ring-primary' : ''}`}
                    >
                      <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-primary/20 flex items-center justify-center mb-2 sm:mb-3">
                        <UserCircle className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-xs sm:text-base truncate max-w-full">{profile.name}</h3>
                        {profile.grade && (
                          <p className="text-xs text-muted-foreground truncate max-w-full">{profile.grade}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2 justify-center">
                          {profile.is_owner && (
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <User className="h-3 w-3" />
                              <span>Primary</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
          
                  {/* Add New Profile Card */}
                  <Card 
                    onClick={() => setShowCreateForm(true)} 
                    className="p-3 sm:p-4 flex flex-col items-center cursor-pointer transition-all border-dashed hover:border-primary"
                  >
                    <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center mb-2 sm:mb-3">
                      <Plus className="h-7 w-7 sm:h-10 sm:w-10 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-xs sm:text-base">Add Profile</h3>
                      <p className="text-xs text-muted-foreground">Create a new profile</p>
                    </div>
                  </Card>
                </div>
          
                <div className="flex justify-end mx-[4px]">
                  <Button variant="outline" onClick={() => {
                    onOpenChange(false);
                    setTimeout(() => {
                      document.body.style.pointerEvents = '';
                      document.body.style.overflow = '';
                    }, 50);
                  }}>
                    Close
                  </Button>
                </div>
              </div>
            </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
