import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, User, CreditCard, Calendar } from 'lucide-react';
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
import { format } from "date-fns";
import { CheckoutButton } from "@/components/subscription/CheckoutButton";
import { ManageSubscriptionButton } from "@/components/subscription/ManageSubscriptionButton";

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

type PlanDetails = {
  id: string;
  plan_type: string;
  plan_label: string;
  price_monthly: number | null;
  price_annual: number | null;
  price_one_time: number | null;
  max_profiles: number;
  max_saved_scores: number | null;
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
  const { 
    isLoggedIn, 
    userId, 
    defaultProfileId, 
    planType, 
    subscriptionStatus, 
    planExpiresAt, 
    checkAndRefreshSubscription, 
    isSubscriptionActive 
  } = useAuth();
  const [isProfileOwner, setIsProfileOwner] = useState(true);
  const [accountEmail, setAccountEmail] = useState('');
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [plans, setPlans] = useState<PlanDetails[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(false);
  const [activePlan, setActivePlan] = useState<PlanDetails | null>(null);
  
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

  // Fetch all plans
  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('max_profiles', { ascending: true });
        
      if (error) {
        console.error('Error fetching plans:', error);
        return;
      }
      
      if (data) {
        setPlans(data);
        
        // Find current active plan
        const currentPlan = data.find(p => p.plan_type === planType);
        if (currentPlan) {
          setActivePlan(currentPlan);
        }
      }
    } catch (err) {
      console.error('Error in fetchPlans:', err);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        navigate('/');
        return;
      }

      try {
        // Refresh subscription details first
        await checkAndRefreshSubscription();
        setActiveSubscription(isSubscriptionActive());
        
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
    fetchPlans();
  }, [navigate, form, userId, defaultProfileId, toast, planType, checkAndRefreshSubscription, isSubscriptionActive]);

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

  // Format date for display
  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
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

      {/* Subscription Info Card */}
      {isProfileOwner && (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Subscription
            </CardTitle>
            <CardDescription>
              Your current plan and subscription details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-2xl font-bold">
                  {activePlan?.plan_label || 'Free Plan'}
                  {activeSubscription && (
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">Active</Badge>
                  )}
                </p>
              </div>
              {planExpiresAt && (
                <div className="text-right">
                  <p className="text-sm font-medium">Expires</p>
                  <p className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1 opacity-70" /> 
                    {formatExpiryDate(planExpiresAt)}
                  </p>
                </div>
              )}
            </div>

            <div className="text-sm">
              <p className="mb-1"><strong>Status:</strong> {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}</p>
              <p><strong>Max Profiles:</strong> {activePlan?.max_profiles || 1}</p>
              <p><strong>Score Saving:</strong> {activePlan?.max_saved_scores === null ? 'Unlimited' : activePlan?.max_saved_scores || 3}</p>
            </div>

            {/* Add Manage Subscription Button */}
            <div className="pt-2">
              <ManageSubscriptionButton className="w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link to="/plans" className="w-full">
              <Button variant="outline" className="w-full">View All Plans</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
      
      {/* Profile Card */}
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
      
      {/* Upgrade Plan Section - Only shown for primary account owners */}
      {isProfileOwner && (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Upgrade Plan</CardTitle>
            <CardDescription>
              Choose a plan that suits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plans.filter(plan => 
                !['guest', 'free'].includes(plan.plan_type) &&
                plan.plan_type !== planType
              ).map(plan => (
                <Card key={plan.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{plan.plan_label}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {plan.price_monthly !== null && (
                        <div className="border rounded-md p-3 text-center">
                          <p className="font-medium">${plan.price_monthly}/mo</p>
                          <CheckoutButton 
                            planType={plan.plan_type}
                            interval="monthly"
                            label="Choose Monthly"
                            variant="outline"
                            className="w-full mt-2"
                          />
                        </div>
                      )}
                      {plan.price_annual !== null && (
                        <div className="border rounded-md p-3 text-center bg-primary/5">
                          <p className="font-medium">${plan.price_annual}/yr</p>
                          <p className="text-xs text-muted-foreground mb-2">Best value</p>
                          <CheckoutButton 
                            planType={plan.plan_type}
                            interval="annual"
                            label="Choose Yearly"
                            variant="default"
                            className="w-full"
                          />
                        </div>
                      )}
                      {plan.price_one_time !== null && (
                        <div className="border rounded-md p-3 text-center">
                          <p className="font-medium">${plan.price_one_time}</p>
                          <p className="text-xs text-muted-foreground mb-2">One-time payment</p>
                          <CheckoutButton 
                            planType={plan.plan_type}
                            interval="one_time"
                            label="Purchase"
                            variant="outline"
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-sm">
                      <p><strong>Profiles:</strong> {plan.max_profiles}</p>
                      <p><strong>Score Storage:</strong> {plan.max_saved_scores === null ? 'Unlimited' : plan.max_saved_scores}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <ProfileSwitcherDialog 
        open={showProfileSwitcher}
        onOpenChange={setShowProfileSwitcher}
      />
    </div>
  );
};

export default MyAccount;
