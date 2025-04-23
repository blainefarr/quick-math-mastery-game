
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/useGame';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface AuthModalProps {
  children: React.ReactNode;
}

const GRADE_OPTIONS = [
  'Pre-K',
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  'High School',
  'High School Grad',
  'College Grad',
];

const AuthModal = ({ children }: AuthModalProps) => {
  const { setIsLoggedIn, setUsername } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    return () => {
      document.body.classList.remove('ReactModal__Body--open');
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      document.body.style.pointerEvents = '';
      document.body.classList.remove('ReactModal__Body--open');
      setError('');
      setSuccessMsg('');
      setPassword('');
    }
  };

  // LOGIN: check real password/email using supabase
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccessMsg('');
    const { data, error: supaError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    if (supaError) {
      setError(supaError.message === "Invalid login credentials" ?
        "Email or password incorrect" : supaError.message);
      return;
    }
    if (data && data.user) {
      setIsLoggedIn(true);
      setUsername(data.user.email?.split('@')[0] || data.user.email || "");
      handleOpenChange(false);
    }
    setEmail('');
    setPassword('');
  };

  // REGISTER: create user via supabase, then set username/grade in public metadata
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    if (!name || !email || !password || !grade) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    // Register via supabase
    const { data, error: supaError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, grade }
      }
    });
    setIsLoading(false);

    if (supaError) {
      setError(supaError.message.includes("already registered") ? "Email already registered." : supaError.message);
      return;
    }

    // If confirmation required, tell user
    if (!data.user) {
      setSuccessMsg("Please check your email to confirm your registration!");
      return;
    }

    setIsLoggedIn(true);
    setUsername(name);
    setGrade('');
    setName('');
    setEmail('');
    setPassword('');
    handleOpenChange(false);
  };

  // FORGOT PASSWORD flow
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email");
      setIsLoading(false);
      return;
    }

    const { error: supaError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/'
    });
    setIsLoading(false);

    if (supaError) {
      setError(supaError.message);
      return;
    }
    setSuccessMsg("Password reset email sent! Check your inbox.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in or create an account to save your progress
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {successMsg && <p className="text-sm text-success">{successMsg}</p>}

              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </DialogFooter>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mt-2 text-primary underline text-xs hover:text-accent"
                  onClick={() => { setActiveTab('forgot'); setError(""); setSuccessMsg(""); }}>
                  Forgot password?
                </button>
              </div>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {successMsg && <p className="text-sm text-success">{successMsg}</p>}

              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Forgot Password Tab */}
          <TabsContent value="forgot">
            <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {successMsg && <p className="text-sm text-success">{successMsg}</p>}
              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </DialogFooter>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mt-2 text-primary underline text-xs hover:text-accent"
                  onClick={() => { setActiveTab('login'); setError(""); setSuccessMsg(""); }}>
                  Back to Login
                </button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
