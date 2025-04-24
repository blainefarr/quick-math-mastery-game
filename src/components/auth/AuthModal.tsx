
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
import { toast } from 'sonner';

interface AuthModalProps {
  children: React.ReactNode;
  defaultTab?: 'login' | 'register';
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

const AuthModal = ({ children, defaultTab = 'register' }: AuthModalProps) => {
  const { setIsLoggedIn, setUsername } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(defaultTab);
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

  // Handle keyboard events
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
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
      setUsername(data.user.user_metadata?.name || data.user.email?.split('@')[0] || data.user.email || "");
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
    
    // Register via supabase with metadata
    const { data, error: supaError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          grade
        }
      }
    });
    
    setIsLoading(false);

    if (supaError) {
      setError(supaError.message.includes("already registered") ? 
        "Email already registered." : supaError.message);
      return;
    }

    // If confirmation required, tell user
    if (!data.user) {
      setSuccessMsg("Please check your email to confirm your registration!");
      return;
    }

    setIsLoggedIn(true);
    setUsername(name);
    setName('');
    setEmail('');
    setPassword('');
    setGrade('');
    handleOpenChange(false);
  };

  // Google authentication
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }
    
    // The page will be redirected to Google, so we don't need to do anything else here
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

  const toggleView = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
    setSuccessMsg('');
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
            {activeTab === 'register' ? 'Create an account to save your progress' : 'Sign in to your account'}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 py-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>
              
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

              <DialogFooter className="flex-col space-y-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </DialogFooter>
              <div className="flex justify-between mt-4 text-sm">
                <button
                  type="button"
                  className="text-primary underline text-xs hover:text-accent"
                  onClick={() => { setActiveTab('forgot'); setError(""); setSuccessMsg(""); }}>
                  Forgot password?
                </button>
                <button
                  type="button"
                  className="text-primary underline text-xs hover:text-accent"
                  onClick={() => toggleView('register')}>
                  New here? Sign up for free
                </button>
              </div>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 py-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>
              
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

              <DialogFooter className="flex-col space-y-2">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </DialogFooter>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="text-primary underline text-xs hover:text-accent"
                  onClick={() => toggleView('login')}>
                  Already have an account? Log in
                </button>
              </div>
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
