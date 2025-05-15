import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth/useAuth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Trophy, TrendingUp, Settings, Users, Target, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileSwitcherDialog } from './ProfileSwitcherDialog';

interface UserDropdownProps {
  username: string;
  dropdownLabel?: string;
  onOpenProfile?: () => void;
  hasMultipleProfiles?: boolean;
}

const UserDropdown = ({ 
  username, 
  dropdownLabel = "My Progress",
  onOpenProfile,
  hasMultipleProfiles = false
}: UserDropdownProps) => {
  const navigate = useNavigate();
  const { handleLogout, planType } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const { toast } = useToast();

  const handleUserLogout = async () => {
    try {
      setIsLoggingOut(true);
      toast({
        title: "Logging out...",
      });
      
      // Close the dropdown first to prevent UI issues
      setTimeout(async () => {
        await handleLogout();
        toast({
          title: "Logged out successfully"
        });
        // No need to navigate here as handleLogout already does window.location.href = '/'
      }, 100);
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Error during logout",
        description: "Please try again",
        variant: "destructive"
      });
      setIsLoggingOut(false);
    }
  };

  // Format plan name for display
  const getPlanDisplay = () => {
    if (!planType || planType === 'free' || planType === 'guest') {
      return (
        <span className="text-xs">
          <span className="text-blue-500 font-medium cursor-pointer" onClick={() => navigate('/plans')}>
            Free plan - Upgrade
          </span>
        </span>
      );
    }
    
    // Capitalize first letter of plan name
    const formattedPlan = planType.charAt(0).toUpperCase() + planType.slice(1);
    return <span className="text-xs text-muted-foreground">{formattedPlan} plan</span>;
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 px-3 rounded-full border flex items-center gap-1">
            {username}
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] pointer-events-auto">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>Hi, {username}!</span>
              {getPlanDisplay()}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowProfileSwitcher(true)}
            className="cursor-pointer hover:bg-accent"
          >
            <Users className="mr-2 h-4 w-4" />
            {hasMultipleProfiles ? "Switch Profile" : "Manage Profiles"}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/progress')}
            className="cursor-pointer hover:bg-accent"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {dropdownLabel}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/goals')}
            className="cursor-pointer hover:bg-accent"
          >
            <Target className="mr-2 h-4 w-4" />
            Goals
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/leaderboard')}
            className="cursor-pointer hover:bg-accent"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/account')}
            className="cursor-pointer hover:bg-accent"
          >
            <Settings className="mr-2 h-4 w-4" />
            My Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleUserLogout} 
            disabled={isLoggingOut}
            className="cursor-pointer hover:bg-accent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Switcher Dialog */}
      <ProfileSwitcherDialog 
        open={showProfileSwitcher} 
        onOpenChange={setShowProfileSwitcher} 
      />
    </div>
  );
};

export default UserDropdown;
