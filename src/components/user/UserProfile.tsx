
import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/useGame';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, LogOut } from 'lucide-react';
import ScoreHistory from './ScoreHistory';
import ScoreChart from './ScoreChart';
import { Label } from '@/components/ui/label';

const UserProfile = () => {
  const { username, isLoggedIn, setIsLoggedIn, scoreHistory } = useGame();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>("all");
  
  // Logout handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    // Clear localStorage on logout
    localStorage.removeItem('mathUserData');
  };
  
  // Get unique ranges from score history
  const getUniqueRanges = () => {
    const uniqueRanges = new Set<string>();
    
    scoreHistory.forEach(score => {
      const { min1, max1, min2, max2 } = score.range;
      const rangeString = `${min1}-${max1}, ${min2}-${max2}`;
      uniqueRanges.add(rangeString);
    });
    
    return Array.from(uniqueRanges);
  };
  
  // Filter scores by selected range
  const getFilteredScores = () => {
    if (selectedRange === "all") {
      return scoreHistory;
    }
    
    // Parse range values
    const [range1, range2] = selectedRange.split(', ');
    const [min1, max1] = range1.split('-').map(Number);
    const [min2, max2] = range2.split('-').map(Number);
    
    return scoreHistory.filter(score => {
      const r = score.range;
      return r.min1 === min1 && r.max1 === max1 && r.min2 === min2 && r.max2 === max2;
    });
  };
  
  const filteredScores = getFilteredScores();
  const uniqueRanges = getUniqueRanges();

  // If not logged in, don't render anything
  if (!isLoggedIn) return null;

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
      
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">My Profile - {username}</DialogTitle>
            <DialogDescription className="sr-only">View and manage your profile</DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {/* Range Filter */}
            <div className="mb-4">
              <Label htmlFor="range-filter" className="mr-2">Filter by Range:</Label>
              <Select 
                value={selectedRange} 
                onValueChange={setSelectedRange}
              >
                <SelectTrigger className="w-[250px]" id="range-filter">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ranges</SelectItem>
                  {uniqueRanges.map((range, index) => (
                    <SelectItem key={index} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">Score History</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <ScoreHistory scores={filteredScores} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="progress" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <ScoreChart scores={filteredScores} />
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
