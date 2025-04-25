
import React, { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { LogOut } from 'lucide-react';
import ScoreHistory from './ScoreHistory';
import ScoreChart from './ScoreChart';
import { Label } from '@/components/ui/label';
import GameContext from '@/context/GameContext';
import { useContext } from 'react';

interface UserProfileProps {
  dropdownLabel?: string;
}

const UserProfile = ({ dropdownLabel = "My Progress" }: UserProfileProps) => {
  const navigate = useNavigate();
  const { username, handleLogout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [selectedOperation, setSelectedOperation] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileScores, setProfileScores] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Safe game context hook that doesn't throw if we're not in a GameProvider
  const useGameContextSafely = () => {
    try {
      const gameContext = useContext(GameContext);
      return { gameContext, hasGameContext: !!gameContext };
    } catch (err) {
      console.error("Failed to access game context:", err);
      return { gameContext: { scoreHistory: [] }, hasGameContext: false };
    }
  };
  
  const { gameContext, hasGameContext } = useGameContextSafely();
  const scoreHistory = hasGameContext && gameContext.scoreHistory ? gameContext.scoreHistory : [];

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
        setLoading(false);
      }
    }
    
    return () => {
      document.body.classList.remove('ReactModal__Body--open');
      document.body.style.pointerEvents = '';
    };
  }, [isProfileOpen, scoreHistory]);

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

  if (!username) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 px-3 rounded-full border">
            {username}
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
          {hasGameContext && (
            <DropdownMenuItem 
              onClick={() => setIsProfileOpen(true)}
              className="cursor-pointer hover:bg-accent"
            >
              {dropdownLabel}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => navigate('/account')}
            className="cursor-pointer hover:bg-accent"
          >
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
      
      {hasGameContext && (
        <Dialog open={isProfileOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl">My Progress - {username}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="history" className="w-full">
                <TabsList className="relative">
                  <TabsTrigger value="history">Score History</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted"></div>
                </TabsList>
                
                <TabsContent value="history" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                        <Label className="mr-2 font-medium whitespace-nowrap">Filter:</Label>
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedRange}
                            onValueChange={setSelectedRange}
                          >
                            <SelectTrigger className="w-[140px] h-8">
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
                            <SelectTrigger className="w-[160px] h-8 text-left">
                              <SelectValue placeholder="All Operations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Operations</SelectItem>
                              <SelectItem value="addition">Addition</SelectItem>
                              <SelectItem value="subtraction">Subtraction</SelectItem>
                              <SelectItem value="multiplication">Multiplication</SelectItem>
                              <SelectItem value="division">Division</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <ScoreHistory scores={filteredScores} />
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="progress" className="mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                        <Label className="mr-2 font-medium whitespace-nowrap">Filter:</Label>
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedRange}
                            onValueChange={setSelectedRange}
                          >
                            <SelectTrigger className="w-[140px] h-8">
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
                            <SelectTrigger className="w-[160px] h-8 text-left">
                              <SelectValue placeholder="All Operations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Operations</SelectItem>
                              <SelectItem value="addition">Addition</SelectItem>
                              <SelectItem value="subtraction">Subtraction</SelectItem>
                              <SelectItem value="multiplication">Multiplication</SelectItem>
                              <SelectItem value="division">Division</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <ScoreChart scores={filteredScores} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default UserProfile;
