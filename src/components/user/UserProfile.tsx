
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
import { toast } from 'sonner';

const UserProfile = () => {
  const { username, isLoggedIn, setIsLoggedIn, scoreHistory } = useGame();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [selectedOperation, setSelectedOperation] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileScores, setProfileScores] = useState([]);

  useEffect(() => {
    if (isProfileOpen) {
      setLoading(true);
      try {
        console.log('Profile dialog opened, current scoreHistory:', scoreHistory);
        setProfileScores(scoreHistory ? [...scoreHistory] : []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading scores:", err);
        setError("Could not load scores");
        toast.error("Failed to load your score history");
        setLoading(false);
      }
    }
    
    return () => {
      document.body.classList.remove('ReactModal__Body--open');
      document.body.style.pointerEvents = '';
    };
  }, [isProfileOpen, scoreHistory]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('mathUserData');
    toast.success("You've been logged out");
  };

  const getUniqueRanges = () => {
    if (!profileScores || profileScores.length === 0) {
      return [];
    }
    
    const uniqueRanges = new Set<string>();
    
    profileScores.forEach(score => {
      if (score && score.range) {
        const { min1, max1, min2, max2 } = score.range;
        const rangeString = `${min1}-${max1}, ${min2}-${max2}`;
        uniqueRanges.add(rangeString);
      }
    });
    
    return Array.from(uniqueRanges);
  };

  const getUniqueOperations = () => {
    if (!profileScores || profileScores.length === 0) {
      return [];
    }
    const uniqueOps = new Set<string>();
    profileScores.forEach(score => {
      if (score && score.operation) uniqueOps.add(score.operation);
    });
    return Array.from(uniqueOps);
  };

  const getFilteredScores = () => {
    let filtered = profileScores ?? [];
    if (selectedRange !== "all") {
      const [range1, range2] = selectedRange.split(', ');
      const [min1, max1] = range1.split('-').map(Number);
      const [min2, max2] = range2.split('-').map(Number);
      filtered = filtered.filter(score => {
        if (!score || !score.range) return false;
        const r = score.range;
        return r.min1 === min1 && r.max1 === max1 && r.min2 === min2 && r.max2 === max2;
      });
    }
    if (selectedOperation !== "all") {
      filtered = filtered.filter(score => score && score.operation === selectedOperation);
    }
    return filtered;
  };

  const filteredScores = getFilteredScores();
  const uniqueRanges = getUniqueRanges();
  const uniqueOperations = getUniqueOperations();

  const handleOpenChange = (open: boolean) => {
    setIsProfileOpen(open);
    if (!open) {
      document.body.style.pointerEvents = '';
      document.body.classList.remove('ReactModal__Body--open');
    }
  };

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
          <DropdownMenuItem onClick={() => handleOpenChange(true)}>
            My Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Dialog open={isProfileOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">My Profile - {username}</DialogTitle>
            <DialogDescription>
              View and manage your profile and score history
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="mb-4">
              <Label className="mr-2 text-base font-semibold mb-2 block">Filter:</Label>
              <div className="flex flex-wrap gap-4">
                <Select
                  value={selectedRange}
                  onValueChange={setSelectedRange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranges</SelectItem>
                    {uniqueRanges.map((range, index) => (
                      <SelectItem key={index} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={selectedOperation}
                  onValueChange={setSelectedOperation}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Operations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Operations</SelectItem>
                    {uniqueOperations.map((op, idx) => (
                      <SelectItem key={idx} value={op}>{op.charAt(0).toUpperCase() + op.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {loading ? (
              <p className="text-center py-8">Loading score history...</p>
            ) : error ? (
              <p className="text-center py-8 text-red-500">{error}</p>
            ) : (
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
            )}
          </div>
          
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                document.body.style.pointerEvents = '';
                document.body.classList.remove('ReactModal__Body--open');
              }}
            >
              Close Profile
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserProfile;
