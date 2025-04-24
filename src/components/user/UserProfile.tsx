
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { User, LogOut } from 'lucide-react';
import ScoreHistory from './ScoreHistory';
import ScoreChart from './ScoreChart';
import useGame from '@/context/useGame';

const UserProfile = () => {
  const { username, handleLogout, scoreHistory } = useGame();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {username}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setSheetOpen(true)}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[90vw] max-w-md sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">Your Profile</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Progress</h3>
              <div className="h-[200px]">
                <ScoreChart scores={scoreHistory} />
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Recent Scores</h3>
              <ScoreHistory scores={scoreHistory} />
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              variant="outline"
              className="text-destructive"
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
    </div>
  );
};

export default UserProfile;
