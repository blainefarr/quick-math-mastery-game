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
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  children: React.ReactNode;
  defaultView?: 'login' | 'register';
}

const AuthModal = ({ children, defaultView = 'register' }: AuthModalProps) => {
  const { setIsLoggedIn, setUsername } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    return () => {
      document.body.classList.remove('ReactModal__Body--open');
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultView);
    }
  }, [isOpen, defaultView]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleOpenChange(false);
    }
  };

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
      console.log("Login successful");
      handleOpenChange(false);
    }
    setEmail('');
    setPassword('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    const { data, error: supaError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    setIsLoading(false);

    if (supaError) {
      setError(supaError.message.includes("already registered") ? 
        "Email already registered." : supaError.message);
      return;
    }

    if (!data.user) {
      setSuccessMsg("Please check your email to confirm your registration!");
      return;
    }

    console.log("Account created successfully!");
    setIsLoggedIn(true);
    setUsername(name);
    setName('');
    setEmail('');
    setPassword('');
    handleOpenChange(false);
  };

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

  const renderLoginContent = () => (
    <div className="space-y-4 py-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Login</h2>
        <p className="text-muted-foreground text-sm">Sign in to your account</p>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full mb-4"
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
        Login with Google
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full border-muted" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs uppercase text-muted-foreground font-medium">
            OR
          </span>
        </div>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              className="text-primary text-xs hover:text-accent underline"
              onClick={(e) => {
                e.preventDefault();
                handleForgotPassword(e);
              }}
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <button
            type="button"
            className="text-primary font-medium hover:text-accent underline"
            onClick={() => setActiveTab("register")}
          >
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  );
  
  const renderRegisterContent = () => (
    <div className="space-y-4 py-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Sign Up</h2>
        <p className="text-muted-foreground text-sm">Create an account to save your progress</p>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full mb-4"
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
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full border-muted" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs uppercase text-muted-foreground font-medium">
            OR
          </span>
        </div>
      </div>
      
      <form onSubmit={handleRegister} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            required
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
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            className="text-primary font-medium hover:text-accent underline"
            onClick={() => setActiveTab("login")}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-md" 
        onKeyDown={handleKeyDown}
      >
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
          className="w-full"
        >
          <TabsContent value="login" className="mt-0 py-2">
            {renderLoginContent()}
          </TabsContent>
          <TabsContent value="register" className="mt-0 py-2">
            {renderRegisterContent()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
