
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
import { Plus, User, UserCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CreateProfileForm } from './CreateProfileForm';

interface Profile {
  id: string;
  name: string;
  grade?: string;
  is_default: boolean;
  created_at: string;
  account_owner?: boolean;  // Property to track the account owner profile
}

interface ProfileSwitcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSwitcherDialog({ open, onOpenChange }: ProfileSwitcherDialogProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { userId, defaultProfileId, setDefaultProfileId, setUsername } = useAuth();

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

  // Fetch all profiles for this account and identify the account owner (first created profile)
  const fetchProfiles = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Get all profiles for this account sorted by creation time
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching profiles:', error);
        toast.error('Failed to load profiles');
        return;
      }
      
      // Mark the first created profile (oldest) as the account owner
      const processedProfiles = data?.map((profile, index) => ({
        ...profile,
        account_owner: index === 0  // First profile is the account owner
      })) || [];
      
      setProfiles(processedProfiles);
    } catch (err) {
      console.error('Error in profile fetch:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open, userId]);

  // Switch to a different profile
  const handleSwitchProfile = async (profile: Profile) => {
    try {
      // Update the local state
      setDefaultProfileId(profile.id);
      setUsername(profile.name || 'User');
      
      // Show success message
      toast.success(`Switched to ${profile.name}`);
      
      // Update the database to mark this as the default profile
      const { error } = await supabase
        .from('profiles')
        .update({ is_default: true })
        .eq('id', profile.id);
      
      if (error) {
        console.error('Error updating default profile:', error);
      }
      
      // Reset the is_default flag for all other profiles
      const { error: resetError } = await supabase
        .from('profiles')
        .update({ is_default: false })
        .eq('account_id', userId)
        .neq('id', profile.id);
      
      if (resetError) {
        console.error('Error resetting other profiles:', resetError);
      }
      
      // Close the dialog and ensure cleanup
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
      open={open} 
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
                          {profile.id === defaultProfileId && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              <span>Active</span>
                            </Badge>
                          )}
                          {profile.account_owner && (
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
