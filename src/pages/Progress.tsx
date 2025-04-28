import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScoreHistory from '@/components/user/ScoreHistory';
import ScoreChart from '@/components/user/ScoreChart';
import { supabase } from '@/integrations/supabase/client';
import { UserScore, Operation } from '@/types';
import { useAuth } from '@/context/auth/useAuth';
import { toast } from 'sonner';

const Progress = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    userId,
    defaultProfileId,
    isLoadingProfile
  } = useAuth();
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [selectedOperation, setSelectedOperation] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileScores, setProfileScores] = useState<UserScore[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      toast.error("You need to be logged in to view your progress");
      return;
    }
    
    const fetchScores = async () => {
      if (isLoadingProfile) {
        console.log('Still loading profile, deferring score fetch');
        return;
      }
      
      if (!defaultProfileId) {
        console.log('No defaultProfileId available, cannot fetch scores');
        return;
      }
      
      setLoading(true);
      try {
        console.log('Fetching scores for profile:', defaultProfileId);
        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .eq('profile_id', defaultProfileId)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching scores:', error);
          toast.error('Failed to load your scores');
          setError("Could not load scores");
          return;
        }

        console.log('Retrieved progress scores:', data);
        const transformedData: UserScore[] = (data || []).map(item => ({
          score: item.score,
          operation: item.operation as Operation,
          range: {
            min1: item.min1,
            max1: item.max1,
            min2: item.min2,
            max2: item.max2
          },
          date: item.date,
          duration: item.duration,
          focusNumber: item.focus_number,
          allowNegatives: item.allow_negatives
        }));
        
        setProfileScores(transformedData);
      } catch (error) {
        console.error('Error fetching scores:', error);
        setError("Could not load scores");
      } finally {
        setLoading(false);
      }
    };
    
    if (defaultProfileId && !isLoadingProfile) {
      fetchScores();
    }
  }, [userId, isAuthenticated, navigate, defaultProfileId, isLoadingProfile]);

  const getUniqueRanges = () => {
    if (!profileScores || profileScores.length === 0) {
      return [];
    }
    const uniqueRanges = new Set<string>();
    profileScores.forEach(score => {
      if (score && score.range) {
        const {
          min1,
          max1,
          min2,
          max2
        } = score.range;
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

  return <div className="container mx-auto py-8 px-4 max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/')} className="h-8 rounded-full">
          <ArrowLeft size={16} className="mr-1" />
          Back to Game
        </Button>
      </div>
      
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">My Progress</h1>
        <p className="text-muted-foreground">Track your math skills over time</p>
      </div>

      {isLoadingProfile ? (
        <Card className="p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading your profile...</p>
        </Card>
      ) : loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading scores...</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="sticky top-0 backdrop-blur z-10 bg-white px-[16px] py-[16px]">
            <div className="flex items-center gap-2">
              <Label className="mr-2 font-medium whitespace-nowrap">Filter:</Label>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedRange} onValueChange={setSelectedRange}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="All Ranges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranges</SelectItem>
                    {uniqueRanges.map((range, index) => <SelectItem key={index} value={range}>{range}</SelectItem>)}
                  </SelectContent>
                </Select>
                
                <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                  <SelectTrigger className="w-[160px] h-8">
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
          </div>

          <div className="mt-4">
            <Tabs defaultValue="progress" className="w-full">
              <div className="px-4">
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="progress">Charts</TabsTrigger>
                  <TabsTrigger value="history">Scores</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="progress" className="p-4">
                <ScoreChart scores={filteredScores} />
              </TabsContent>
              
              <TabsContent value="history" className="p-4">
                <ScoreHistory scores={filteredScores} />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      )}
    </div>;
};

export default Progress;
