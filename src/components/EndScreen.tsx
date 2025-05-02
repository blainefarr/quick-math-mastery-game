import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, TrendingUp, Medal, Settings, Trophy, Award, Star, UserPlus } from 'lucide-react';
import MathIcon from './common/MathIcon';
import ConfettiEffect from './common/ConfettiEffect';
import { Badge } from '@/components/ui/badge';
import useGoalProgress, { getGoalLevel, getLevelEmoji } from '@/hooks/useGoalProgress';
import { useLeaderboard } from '@/hooks/useLeaderboard';
const EndScreen = () => {
  const navigate = useNavigate();
  const {
    score,
    resetScore,
    settings,
    setGameState,
    setTimeLeft,
    getIsHighScore,
    isLoggedIn,
    setUserAnswer,
    scoreHistory
  } = useGame();
  const isHighScore = getIsHighScore(score, settings.operation, settings.range);

  // Get goal progress info
  const {
    updateGoalProgress
  } = useGoalProgress();

  // Get user rank info from leaderboard
  const {
    userRank
  } = useLeaderboard();

  // Determine personal best ranking
  const getPersonalBestRanking = () => {
    if (!scoreHistory || scoreHistory.length === 0) return null;
    const matchingScores = scoreHistory.filter(s => s.operation === settings.operation && s.range.min1 === settings.range.min1 && s.range.max1 === settings.range.max1 && s.range.min2 === settings.range.min2 && s.range.max2 === settings.range.max2);
    if (matchingScores.length <= 1) return null;
    const sortedScores = [...matchingScores].sort((a, b) => b.score - a.score);
    const position = sortedScores.findIndex(s => s.score === score) + 1;
    if (position === 1) return {
      position: 1,
      label: "Personal Best!"
    };
    if (position === 2) return {
      position: 2,
      label: "Your 2nd Best!"
    };
    if (position === 3) return {
      position: 3,
      label: "Your 3rd Best!"
    };
    if (position <= 10) return {
      position: position,
      label: `Your ${position}th Best!`
    };
    return null;
  };

  // Get achievement level based on score
  const achievementLevel = getGoalLevel(score);
  const achievementEmoji = getLevelEmoji(achievementLevel);

  // Show achievement message if score is high enough
  const getAchievementMessage = () => {
    if (score < 20) return null;
    switch (achievementLevel) {
      case 'legend':
        return 'Legend Status - over 60!';
      case 'star':
        return 'Star Level - over 50!';
      case 'gold':
        return 'Gold Level - over 40!';
      case 'silver':
        return 'Silver Level - over 30!';
      case 'bronze':
        return 'Bronze Level - over 20!';
      default:
        return null;
    }
  };
  useEffect(() => {
    const audio = new Audio();
    audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAACsAWlpaWlpaWlpaWlp6enp6enp6enp6enp6enp6enp6epqampqampqampqaurq6urq6urq6urra2tra2tra2tra2vr6+vr6+vr6+vr6GhoaGhoaGhoaGho6Ojo6Ojo6Ojo6OlpaWlpaWlpaWlp6enp6enp6enp6epqampqampqampqa//NCxAAAAANIAAAAAurq6urq6urq6ura2tra2tra2tra2vr6+vr6+vr6+vr6GhoaGhoaGhoaGho6Ojo6Ojo6Ojo6OlpaWlpaWlpaWlpaqqqqqqqqqqqqqqqqqqqqqqqqv/zgMSAAACQABzxQAhAgBgeM4yqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//+ZVZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ';
    audio.volume = 0.2;
    audio.play().catch(err => console.error("Failed to play sound:", err));
  }, []);
  const handleRestart = () => {
    resetScore();
    setTimeLeft(settings.timerSeconds);
    setUserAnswer(''); // Clear any previous answer
    setGameState('playing');
  };
  const handleBackToSelection = () => {
    resetScore();
    setUserAnswer(''); // Clear any previous answer
    setGameState('selection');
  };
  const getOperationName = () => {
    switch (settings.operation) {
      case 'addition':
        return 'Addition';
      case 'subtraction':
        return 'Subtraction';
      case 'multiplication':
        return 'Multiplication';
      case 'division':
        return 'Division';
      default:
        return '';
    }
  };
  const getRangeDescription = () => {
    const {
      min1,
      max1,
      min2,
      max2
    } = settings.range;
    return `${min1}-${max1} and ${min2}-${max2}`;
  };
  const personalBestRank = getPersonalBestRanking();
  const achievementMessage = getAchievementMessage();

  // Determine if we should add background celebration
  const shouldShowCelebration = isHighScore || personalBestRank?.position <= 3 || achievementMessage !== null;

  // Get badge style for personal best
  const getPersonalBestBadgeStyle = () => {
    if (!personalBestRank) return {};
    switch (personalBestRank.position) {
      case 1:
        return {
          variant: "secondary",
          className: "bg-amber-400/70 text-black hover:bg-amber-400/90 border-amber-500"
        };
      case 2:
        return {
          variant: "secondary",
          className: "bg-zinc-300/70 text-black hover:bg-zinc-300/90 border-zinc-400"
        };
      case 3:
        return {
          variant: "secondary",
          className: "bg-amber-700/70 text-white hover:bg-amber-700/90 border-amber-800"
        };
      default:
        return {
          variant: "outline",
          className: "hover:bg-muted/50"
        };
    }
  };

  // Get badge icon for personal best
  const getPersonalBestIcon = () => {
    if (!personalBestRank) return <Trophy size={14} className="mr-1" />;
    switch (personalBestRank.position) {
      case 1:
        return <Trophy size={14} className="mr-1 text-amber-700" />;
      case 2:
        return <Medal size={14} className="mr-1" />;
      case 3:
        return <Award size={14} className="mr-1" />;
      default:
        return <Trophy size={14} className="mr-1" />;
    }
  };
  const personalBestBadgeStyle = getPersonalBestBadgeStyle();
  return <main className="flex flex-col items-center w-full min-h-screen px-4 pt-6 sm:pt-10">
      <ConfettiEffect score={score} />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-bold text-primary">Game Over!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {/* Score Display */}
          <div className="flex justify-center">
            <div className={`text-center ${shouldShowCelebration ? 'bg-gradient-to-r from-primary/20 to-secondary/20' : 'bg-muted/50'} rounded-xl w-full py-6 flex flex-col justify-center items-center shadow-inner relative overflow-hidden`}>
              {/* Celebration background for high scores/achievements */}
              {shouldShowCelebration && <div className="absolute inset-0 z-0 opacity-20">
                  {Array.from({
                length: 12
              }).map((_, i) => <div key={i} className="absolute rounded-full" style={{
                width: `${Math.random() * 20 + 10}px`,
                height: `${Math.random() * 20 + 10}px`,
                backgroundColor: ['#9b87f5', '#7E69AB', '#FEC6A1', '#FEF7CD', '#F2FCE2', '#D3E4FD'][Math.floor(Math.random() * 6)],
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }} />)}
                </div>}
            
              <span className={`text-sm ${isHighScore && score > 0 ? 'text-accent' : 'text-muted-foreground'} font-medium relative z-10`}>
                {isHighScore && score > 0 ? 'New High Score!' : 'Final Score'}
              </span>
              <span className={`text-6xl font-bold ${isHighScore && score > 0 ? 'text-primary' : 'text-primary'} relative z-10`}>
                {score}
              </span>
              {score > 0 && <div className="mt-2 flex flex-wrap justify-center gap-2 relative z-10">
                  {personalBestRank && <Badge variant={personalBestBadgeStyle.variant as any} className={`cursor-pointer animate-fade-in ${personalBestBadgeStyle.className}`} onClick={() => navigate('/progress')}>
                      {getPersonalBestIcon()} {personalBestRank.label}
                    </Badge>}
                  
                  {isLoggedIn ? userRank && <Badge variant="outline" className="cursor-pointer animate-fade-in hover:bg-muted/50" onClick={() => navigate('/leaderboard')}>
                        <Award size={14} className="mr-1" /> #{userRank} All-time
                      </Badge> : <div className="flex flex-col items-center w-full gap-2 mt-1">
                      <Badge variant="outline" className="cursor-default animate-fade-in hover:bg-muted/50">
                        <Award size={14} className="mr-1" /> #{Math.floor(Math.random() * 30) + 1} All-time
                      </Badge>
                      <Button size="sm" variant="secondary" className="text-xs py-1 h-auto animate-fade-in" onClick={() => navigate('/account')}>
                        <UserPlus size={14} className="mr-1" /> 
                        Sign up to join the leaderboard
                      </Button>
                    </div>}
                </div>}
            </div>
          </div>
          
          {/* Achievement Notification */}
          {achievementMessage && <div className="bg-accent/10 p-3 rounded-lg text-center cursor-pointer hover:bg-accent/20 transition-colors animate-scale-in" onClick={() => navigate('/goals')}>
              <p className="font-medium text-accent flex items-center justify-center gap-2">
                <span>{achievementEmoji}</span>
                <span>{achievementMessage}</span>
                <Star size={16} className="ml-1 animate-pulse" />
              </p>
            </div>}
          
          {/* Game Settings */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Game Settings</h3>
              <MathIcon operation={settings.operation} className="text-accent" size={18} />
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Operation:</span>
                  <span>{getOperationName()}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Time:</span>
                  <span>{settings.timerSeconds}s</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium mr-2">Range:</span>
                  <span className="bg-secondary/10 px-2 py-0.5 rounded-md text-xs">{getRangeDescription()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleRestart} className="w-full bg-primary hover:bg-primary/90 flex items-center" type="button">
            <RefreshCw className="mr-2" size={16} />
            Play Again
          </Button>
          
          {isLoggedIn ? <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 flex items-center" onClick={() => navigate('/progress')} type="button">
              <TrendingUp className="mr-2" size={16} />
              See Progress
            </Button> : <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 flex items-center" onClick={() => navigate('/account')} type="button">
              <UserPlus className="mr-2" size={16} />
              Sign Up to Save Progress
            </Button>}
          
          <Button onClick={handleBackToSelection} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 flex items-center" type="button">
            <Settings className="mr-2" size={16} />
            Change Settings
          </Button>
        </CardFooter>
      </Card>
    </main>;
};
export default EndScreen;