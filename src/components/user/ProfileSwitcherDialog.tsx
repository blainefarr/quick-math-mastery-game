
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Plus, User, UserCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateProfileForm } from './CreateProfileForm';
import { ACTIVE_PROFILE_KEY } from '@/context/auth/utils/profileUtils';

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

export function ProfileSwitcherDialog({ open, onOpenChange }: ProfileSwitcherDialogProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { 
    userId, 
    defaultProfileId, 
    setDefaultProfileId, 
    setUsername, 
    refreshUserProfile,
    hasMultipleProfiles,
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

  // Retry fetching profiles for new users
  const retryFetchProfiles = async () => {
    if (!userId || retryCount >= 4) return;
    
    setIsRetrying(true);
    setError(null);
    
    console.log(`Retry attempt ${retryCount + 1}/4 for profiles...`);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = await fetchProfiles(true);
    
    if (!success) {
      setRetryCount(prev => prev + 1);
    } else {
      setRetryCount(0);
    }
    
    setIsRetrying(false);
  };

  // Fetch all profiles for this account
  const fetchProfiles = async (isRetry = false): Promise<boolean> => {
    if (!userId) {
      console.error('Cannot fetch profiles: No user ID available');
      setError('No user ID available');
      setLoading(false);
      return false;
    }
    
    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError(null);
      console.log('Fetching profiles for user ID:', userId);
      
      // Get all profiles for this account sorted by creation time
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching profiles:', error);
        setError('Failed to load profiles');
        
        if (!isRetry) {
          toast.error('Failed to load profiles');
        }
        return false;
      }
      
      // Get the active profile ID from localStorage
      const activeProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY) || defaultProfileId;
      
      if (!data || data.length === 0) {
        console.error('No profiles found for account:', userId);
        setError('No profiles found');
        setProfiles([]);
        
        if (!isRetry && retryCount === 0) {
          console.log('No profiles found, will retry shortly...');
          // Schedule first retry
          setTimeout(() => retryFetchProfiles(), 500);
        }
        
        return false;
      }
      
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
      setError('An unexpected error occurred');
      return false;
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
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
      toast.success(`Switched to ${profile.name}`);
      
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
      toast.error('Failed to switch profile');
    }
  };

  // Handle profile creation success
  const handleProfileCreated = (newProfile: Profile) => {
    setShowCreateForm(false);
    fetchProfiles();
    handleSwitchProfile(newProfile);
  };

  return (
    <Dialog 
      open={open && !isNewSignup} 
      onOpenChange={(newOpen) => {
        // Extra cleanup when dialog is closing
        if (!newOpen) {
          setTimeout(() => {
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';
          }, 50);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Choose a Profile</DialogTitle>
          <DialogDescription>
            Select a profile or create a new one
          </DialogDescription>
        </DialogHeader>
        
        {showCreateForm ? (
          <div className="p-6">
            <CreateProfileForm 
              onSuccess={handleProfileCreated} 
              onCancel={() => setShowCreateForm(false)} 
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  Loading profiles...
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-8 text-red-500 flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8" />
                  <p>{error}</p>
                  {retryCount < 4 ? (
                    <Button 
                      variant="outline" 
                      onClick={() => retryFetchProfiles()}
                      className="mt-2 flex items-center gap-2"
                      disabled={isRetrying}
                    >
                      {isRetrying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>Try Again ({retryCount}/4)</>
                      )}
                    </Button>
                  ) : (
                    <div className="text-center mt-2">
                      <p className="text-sm mb-2">Maximum retries reached.</p>
                      <Button 
                        onClick={() => setShowCreateForm(true)}
                        className="mx-auto"
                      >
                        Create New Profile
                      </Button>
                    </div>
                  )}
                </div>
              ) : profiles.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="mb-4">No profiles found for your account.</p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="mx-auto"
                  >
                    Create Your First Profile
                  </Button>
                </div>
              ) : (
                <>
                  {profiles.map((profile) => (
                    <Card 
                      key={profile.id}
                      onClick={() => handleSwitchProfile(profile)}
                      className={`p-4 flex flex-col items-center cursor-pointer transition-all hover:border-primary ${
                        profile.id === defaultProfileId ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                        <UserCircle className="h-12 w-12 text-primary" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium">{profile.name}</h3>
                        {profile.grade && (
                          <p className="text-sm text-muted-foreground">{profile.grade}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2 justify-center">
                          {profile.is_owner && (
                            <Badge variant="secondary" className="flex items-center gap-1">
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
                    className="p-4 flex flex-col items-center cursor-pointer transition-all border-dashed hover:border-primary"
                  >
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Plus className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium">Add Profile</h3>
                      <p className="text-sm text-muted-foreground">Create a new profile</p>
                    </div>
                  </Card>
                </>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Enhanced cleanup before closing
                  onOpenChange(false);
                  setTimeout(() => {
                    document.body.style.pointerEvents = '';
                    document.body.style.overflow = '';
                  }, 50);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
