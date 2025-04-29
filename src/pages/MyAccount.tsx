
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth/useAuth";
import { ProfileSwitcherDialog } from "@/components/user/ProfileSwitcherDialog";
import { CreateProfileForm } from '@/components/user/CreateProfileForm';

type FormData = {
  name: string;
  grade: string;
  email: string;
};

const gradeOptions = [
  "Pre-k",
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th - 9th Grade",
  "High School",
  "Adult"
];

const ACTIVE_PROFILE_KEY = 'math_game_active_profile';

const MyAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId, defaultProfileId, isReady } = useAuth();
  const [isProfileOwner, setIsProfileOwner] = useState(true);
  const [accountEmail, setAccountEmail] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      grade: '',
      email: '',
    }
  });

  useEffect(() => {
    // Wait for the auth state to be ready before fetching profile data
    if (!isReady || !userId || !defaultProfileId) {
      return;
    }

    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // First, get the account information
        const { data: account, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', userId)
          .single();

        if (accountError) {
          console.error('Error fetching account:', accountError);
          toast({
            title: "Error",
            description: "Could not load account data. Please try again.",
            variant: "destructive",
          });
          return;
        }

        setAccountEmail(account?.email || '');

        // Then, get the active profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', defaultProfileId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            title: "Error",
            description: "Could not load profile data. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (profile) {
          console.log('Loaded profile:', profile);
          // Check if this is the primary profile (owner)
          setIsProfileOwner(profile.is_owner);
          
          form.reset({
            name: profile.name || '',
            grade: profile.grade || '',
            email: account?.email || '',
          });
        }
      } catch (err) {
        console.error('Error in profile fetch:', err);
        toast({
          title: "Error",
          description: "Failed to load account information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, defaultProfileId, form, toast, isReady]);

  const onSubmit = async (data: FormData) => {
    if (!userId || !defaultProfileId) {
      toast({
        title: "Error",
        description: "No active profile found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          grade: data.grade,
        })
        .eq('id', defaultProfileId);

      if (profileError) throw profileError;

      if (isProfileOwner) {
        // Update account email only if this is the account owner
        const { error: accountError } = await supabase
          .from('accounts')
          .update({
            email: data.email,
          })
          .eq('id', userId);

        if (accountError) throw accountError;
      }

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
      
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdated = async () => {
    if (!userId || !defaultProfileId) {
      toast({
        title: "Error",
        description: "No active profile found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Refresh the profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', defaultProfileId)
        .single();

      if (profileError) throw profileError;

      if (profile) {
        form.reset({
          name: profile.name || '',
          grade: profile.grade || '',
          email: form.getValues().email,
        });
      }
      
      setIsEditingProfile(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast({
        title: "Error",
        description: "Failed to refresh profile data.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/')}
          className="h-8 rounded-full"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Game
        </Button>
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">My Account</h1>
        <p className="text-muted-foreground">Manage your profile settings</p>
      </div>
      
      <Card className="max-w-xl mx-auto">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Loading your account information...</p>
            </div>
          ) : isEditingProfile ? (
            <CreateProfileForm 
              onSuccess={handleProfileUpdated}
              onCancel={() => setIsEditingProfile(false)}
              initialValues={{
                name: form.getValues().name,
                grade: form.getValues().grade,
              }}
              isEditing={true}
              profileId={defaultProfileId || undefined}
            />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gradeOptions.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* New Profile Role field (non-editable) */}
                <div className="space-y-2">
                  <Label htmlFor="profile-role">Profile Role</Label>
                  <Input 
                    id="profile-role" 
                    value={isProfileOwner ? "Primary Owner" : "User"} 
                    readOnly 
                    disabled 
                    className="bg-muted"
                  />
                </div>

                {isProfileOwner && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {!isProfileOwner && accountEmail && (
                  <div className="space-y-2">
                    <Label>Account Email</Label>
                    <p className="text-sm text-muted-foreground">{accountEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      This profile is using the account created with this email.
                    </p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Manage Profiles Section */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Manage Profiles</h3>
            <Button 
              variant="outline" 
              onClick={() => setShowProfileSwitcher(true)}
              className="flex items-center gap-2 w-full justify-center"
            >
              <Users size={16} />
              Switch Profile
            </Button>
          </div>

          {/* Password section - only for account owner */}
          {isProfileOwner && (
            <div className="mt-8 pt-6 border-t">
              <Label className="text-base">Password</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Update your password to keep your account secure.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  const email = form.getValues('email');
                  if (email) {
                    supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    toast({
                      title: "Password Reset Email Sent",
                      description: "Check your email for the password reset link.",
                    });
                  } else {
                    toast({
                      title: "Error",
                      description: "Please enter your email first.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Change Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ProfileSwitcherDialog 
        open={showProfileSwitcher}
        onOpenChange={setShowProfileSwitcher}
      />
    </div>
  );
};

export default MyAccount;
