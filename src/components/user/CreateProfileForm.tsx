
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50),
  grade: z.string().optional(),
});

interface CreateProfileFormProps {
  onSuccess: (profile: any) => void;
  onCancel: () => void;
  initialValues?: {
    name: string;
    grade?: string;
  };
  isEditing?: boolean;
  profileId?: string;
}

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

export function CreateProfileForm({
  onSuccess,
  onCancel,
  initialValues = { name: '', grade: undefined },
  isEditing = false,
  profileId
}: CreateProfileFormProps) {
  const { userId } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      toast.error("You need to be logged in to create a profile");
      return;
    }

    try {
      if (isEditing && profileId) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update({
            name: values.name,
            grade: values.grade || null,
          })
          .eq('id', profileId)
          .select();

        if (error) throw error;
        
        toast.success("Profile updated successfully");
        onSuccess(data?.[0]);
      } else {
        // Create new profile - removed is_default field which doesn't exist
        const { data, error } = await supabase
          .from('profiles')
          .insert([
            {
              account_id: userId,
              name: values.name,
              grade: values.grade || null,
              is_active: false, // New profiles are not active by default
              is_owner: false   // New profiles are not owner by default
            },
          ])
          .select();

        if (error) throw error;
        
        toast.success("Profile created successfully");
        onSuccess(data?.[0]);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(isEditing ? "Failed to update profile" : "Failed to create profile");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed for this profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormDescription>
                This helps personalize the learning experience.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
