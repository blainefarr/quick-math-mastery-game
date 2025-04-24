
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { User, LogOut } from 'lucide-react';
import ScoreHistory from './ScoreHistory';
import useGame from '@/context/useGame';

const UserProfile = () => {
  const { username, handleLogout } = useGame();
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const userInitial = username ? username.charAt(0).toUpperCase() : 'U';
  
  return (
    <div className="flex items-center gap-2">
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-primary/10 rounded-full p-2 h-auto w-auto"
          >
            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[90vw] max-w-md sm:max-w-md overflow-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold">Your Profile</SheetTitle>
          </SheetHeader>
          
          <div className="mb-6">
            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
              <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{username}</p>
              </div>
            </div>
          </div>
          
          <ScoreHistory />
          
          <div className="mt-8 flex justify-end">
            <Button 
              variant="outline" 
              className="text-destructive border-destructive hover:bg-destructive/10" 
              onClick={() => {
                handleLogout();
                setSheetOpen(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="shadow-sm hover:shadow">
            {username}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfile;
