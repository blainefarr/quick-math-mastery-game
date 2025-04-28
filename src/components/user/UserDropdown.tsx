
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/context/auth/useAuth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Trophy, TrendingUp, Settings } from 'lucide-react';

interface UserDropdownProps {
  username: string;
  onOpenProfile?: () => void;
  dropdownLabel?: string;
}

const UserDropdown = ({ 
  username, 
  onOpenProfile, 
  dropdownLabel = "My Progress" 
}: UserDropdownProps) => {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleUserLogout = async () => {
    try {
      setIsLoggingOut(true);
      await handleLogout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 px-3 rounded-full border">
            {username}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>Hi, {username}!</span>
              <span className="text-xs text-muted-foreground">Logged in</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {onOpenProfile && (
            <DropdownMenuItem 
              onClick={onOpenProfile}
              className="cursor-pointer hover:bg-accent"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {dropdownLabel}
            </DropdownMenuItem>
          )}
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
    </div>
  );
};

export default UserDropdown;
