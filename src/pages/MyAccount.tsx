
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, User } from 'lucide-react';
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
import useAuth from "@/context/auth/useAuth";
import { ProfileSwitcherDialog } from "@/components/user/ProfileSwitcherDialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type FormData = {
  name: string;
  grade: string;
  email: string;
};

type Profile = {
  id: string;
  name: string;
  grade?: string;
  is_owner: boolean;
  created_at: string;
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
  const { isLoggedIn, userId, defaultProfileId } = useAuth();
  const [isProfileOwner, setIsProfileOwner] = useState(true);
  const [accountEmail, setAccountEmail] = useState('');
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      grade: '',
      email: '',
    }
  });

  // Fetch all profiles for account owner
  const fetchAllProfiles = async (accountId: string) => {
    if (!isProfileOwner) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching all profiles:', error);
        return;
      }
      
      if (data) {
        setAllProfiles(data);
      }
    } catch (err) {
      console.error('Error in fetchAllProfiles:', err);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        navigate('/');
        return;
      }

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

        // Get the profile ID from defaultProfileId context or localStorage
        const profileId = defaultProfileId || localStorage.getItem(ACTIVE_PROFILE_KEY);

        // Then, get the active profile for this user
        if (!profileId) {
          console.log('No profile ID set');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
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
          // Check if this is the primary profile (owner)
          const isPrimaryOwner = profile.is_owner;
          setIsProfileOwner(isPrimaryOwner);
          
          // If primary owner, fetch all profiles for this account
          if (isPrimaryOwner) {
            fetchAllProfiles(userId);
          }
          
          form.reset({
            name: profile.name || '',
            grade: profile.grade || '',
            email: account?.email || '',
          });
        }
      } catch (err) {
        console.error('Error in profile fetch:', err);
      }
    };

    fetchUserProfile();
  }, [navigate, form, userId, defaultProfileId, toast]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!userId) return;

      // Get the profile ID from defaultProfileId context or localStorage
      const profileId = defaultProfileId || localStorage.getItem(ACTIVE_PROFILE_KEY);
      
      if (!profileId) {
        toast({
          title: "Error",
          description: "No active profile found",
          variant: "destructive",
        });
        return;
      }

      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          grade: data.grade,
        })
        .eq('id', profileId);

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
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Could not update profile. Please try again.",
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
                <Button type="submit">
                  Save Profile
                </Button>
              </div>
            </form>
          </Form>

          {/* Password section - moved up for primary owners */}
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

          {/* Manage Profiles Section - Only shown for primary account owners */}
          {isProfileOwner && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Manage Profiles</h3>
              
              {/* List of all profiles */}
              <div className="space-y-3 mb-4">
                {allProfiles.length > 0 ? (
                  allProfiles.map(profile => (
                    <div key={profile.id} className="flex items-center justify-between p-3 bg-background border rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{profile.name}</p>
                          {profile.grade && <p className="text-xs text-muted-foreground">{profile.grade}</p>}
                        </div>
                      </div>
                      {profile.is_owner && (
                        <Badge variant="outline" className="ml-auto">Primary</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No profiles found</p>
                )}
              </div>
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
