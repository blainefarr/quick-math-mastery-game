
import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/context/auth/useAuth';
import { completeSignUp } from '@/context/auth/utils/signup';

interface AuthModalProps {
  children?: React.ReactNode;
  defaultView?: 'login' | 'register';
  open?: boolean;
  onClose?: (isAuthenticated: boolean) => void;
}

const AuthModal = ({ children, defaultView = 'register', open: controlledOpen, onClose }: AuthModalProps) => {
  const { setIsLoggedIn, setUsername } = useAuth();
  const [isOpen, setIsOpen] = useState(controlledOpen || false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resetCooldown, setResetCooldown] = useState(60); // Default 60 seconds cooldown
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  useEffect(() => {
    return () => {
      document.body.classList.remove('ReactModal__Body--open');
      document.body.style.pointerEvents = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (controlledOpen !== undefined) {
      setIsOpen(controlledOpen);
    }
  }, [controlledOpen]);

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
      if (onClose) {
        onClose(userAuthenticated);
      }
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
    
    try {
      const { data, error: supaError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (supaError) {
        setError(supaError.message === "Invalid login credentials" ?
          "Email or password incorrect" : supaError.message);
        return;
      }
      
      if (data && data.user) {
        setIsLoggedIn(true);
        setUsername(data.user.user_metadata?.name || data.user.email?.split('@')[0] || data.user.email || "");
        toast.success("Successfully logged in!");
        setUserAuthenticated(true);
        handleOpenChange(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
      setEmail('');
      setPassword('');
    }
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
    
    try {
      console.log('Starting complete signup process with email:', email);
      
      // This is the enhanced signup that waits for account and profile to be created
      const result = await completeSignUp(email, password, name);
      
      console.log('Sign up completed successfully with:', result);
      toast.success("Account created successfully!");
      setUserAuthenticated(true);
      handleOpenChange(false);
      // The auth state will be handled by the auth listener
    } catch (error) {
      console.error("Registration error:", error);
      setError(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsLoading(false);
      setName('');
      setEmail('');
      setPassword('');
    }
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
    
    handleOpenChange(false);
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

    // Update with the correct redirect URL
    const { error: supaError, data } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setIsLoading(false);

    if (supaError) {
      if (supaError.message.includes('For security purposes, you can only request this once every')) {
        // Extract cooldown time from error message
        const match = supaError.message.match(/once every (\d+) seconds/);
        if (match && match[1]) {
          const cooldownSeconds = parseInt(match[1]);
          setResetCooldown(cooldownSeconds);
          setError(`For security purposes, you can only request this once every ${cooldownSeconds} seconds.`);
        } else {
          setError(supaError.message);
        }
      } else {
        setError(supaError.message);
      }
      return;
    }
    setSuccessMsg("Password reset email sent! Check your inbox.");
  };

  // Rendering the content
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

  // For controlled modal without children triggers
  if (controlledOpen !== undefined && !children) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
  }

  // For regular modal with children triggers
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
