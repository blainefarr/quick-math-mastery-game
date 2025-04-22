
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, LogOut } from 'lucide-react';
import ScoreHistory from './ScoreHistory';
import ScoreChart from './ScoreChart';

const UserProfile = () => {
  const { username, isLoggedIn, setIsLoggedIn, scoreHistory } = useGame();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    // Clear localStorage on logout
    localStorage.removeItem('mathUserData');
  };
  
  // If not logged in, don't render anything
  if (!isLoggedIn) return null;

  // Close trap: fix UI by resetting scroll/focus lock
  const handleDialogClose = (open: boolean) => {
    setIsProfileOpen(open);
    if (!open) {
      // After dialog closes, restore document scroll/focus
      document.body.classList.remove('ReactModal__Body--open');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 rounded-full p-0 border">
            <User size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>Hi, {username}!</span>
              <span className="text-xs text-muted-foreground">Logged in</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
            My Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={isProfileOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">My Profile - {username}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">Score History</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <ScoreHistory scores={scoreHistory} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="progress" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <ScoreChart scores={scoreHistory} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-4">Close Profile</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfile;
