
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from 'lucide-react';
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

const MyAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn, userId } = useAuth();
  const [defaultProfileId, setDefaultProfileId] = useState<string | null>(null);
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      grade: '',
      email: '',
    }
  });

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

        // Then, get the default profile for this user
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('account_id', userId)
          .eq('is_default', true)
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
          setDefaultProfileId(profile.id);
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
  }, [navigate, form, userId, toast]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!userId || !defaultProfileId) return;

      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          grade: data.grade,
        })
        .eq('id', defaultProfileId);

      if (profileError) throw profileError;

      // Update account email
      const { error: accountError } = await supabase
        .from('accounts')
        .update({
          email: data.email,
        })
        .eq('id', userId);

      if (accountError) throw accountError;

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

              <div className="flex justify-end">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>

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
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAccount;
