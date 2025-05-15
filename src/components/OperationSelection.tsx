import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Operation } from '@/types';
import OperationButton from './operation/OperationButton';
import NumberRangeSection from './operation/NumberRangeSection';
import TimerSelect from './operation/TimerSelect';
import AdvancedSettings from './operation/AdvancedSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/auth/useAuth';

const OperationSelection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const {
    settings,
    updateSettings,
    setGameState,
    setTimeLeft,
    focusNumber,
    setFocusNumber,
    resetScore,
    hasSaveScoreLimitReached,
    setShowScoreSavePaywall,
    setCanSaveCurrentScore
  } = useGame();
  
  const { planType, isLoggedIn } = useAuth();

  // Local state for form values
  const [selectedOperation, setSelectedOperation] = useState<Operation>(settings.operation);
  const [negativeNumbersEnabled, setNegativeNumbersEnabled] = useState(settings.allowNegatives || false);
  const [learnerModeEnabled, setLearnerModeEnabled] = useState(settings.learnerMode || false);
  const [customNumberPadEnabled, setCustomNumberPadEnabled] = useState(settings.useCustomNumberPad || false);
  const [typingSpeedEnabled, setTypingSpeedEnabled] = useState(settings.typingSpeedAdjustment || false);
  const [range1Min, setRange1Min] = useState(settings.range.min1);
  const [range1Max, setRange1Max] = useState(settings.range.max1);
  const [range2Min, setRange2Min] = useState(settings.range.min2);
  const [range2Max, setRange2Max] = useState(settings.range.max2);
  const [useFocusNumber, setUseFocusNumber] = useState(focusNumber !== null);
  const [focusNumberValue, setFocusNumberValue] = useState(focusNumber || 1);

  // Process URL parameters on initial load
  useEffect(() => {
    const urlOperation = searchParams.get('operation');
    const urlFocusNumber = searchParams.get('focusNumber');
    const urlRangeMin = searchParams.get('rangeMin');
    const urlRangeMax = searchParams.get('rangeMax');

    // Only apply URL parameters if they exist
    if (urlOperation || urlFocusNumber || urlRangeMin && urlRangeMax) {
      console.log('Applying URL parameters to game settings');
      const updatedSettings = {
        ...settings
      };

      // Handle operation parameter
      if (urlOperation && ['addition', 'subtraction', 'multiplication', 'division'].includes(urlOperation)) {
        const typedOperation = urlOperation as Operation;
        setSelectedOperation(typedOperation);
        updatedSettings.operation = typedOperation;
      }

      // Handle focus number parameter
      if (urlFocusNumber) {
        const parsedFocusNumber = parseInt(urlFocusNumber, 10);
        if (!isNaN(parsedFocusNumber)) {
          setUseFocusNumber(true);
          setFocusNumberValue(parsedFocusNumber);
          setFocusNumber(parsedFocusNumber);
          setRange1Min(parsedFocusNumber);
          setRange1Max(parsedFocusNumber);
          updatedSettings.focusNumber = parsedFocusNumber;
          updatedSettings.range = {
            ...updatedSettings.range,
            min1: parsedFocusNumber,
            max1: parsedFocusNumber
          };
        }
      }
      // Handle range parameters
      else if (urlRangeMin && urlRangeMax) {
        const parsedMin = parseInt(urlRangeMin, 10);
        const parsedMax = parseInt(urlRangeMax, 10);
        if (!isNaN(parsedMin) && !isNaN(parsedMax)) {
          setUseFocusNumber(false);
          setFocusNumber(null);
          setRange1Min(parsedMin);
          setRange1Max(parsedMax);
          updatedSettings.focusNumber = null;
          updatedSettings.range = {
            ...updatedSettings.range,
            min1: parsedMin,
            max1: parsedMax
          };
        }
      }

      // Apply the updated settings
      updateSettings(updatedSettings);

      // Clear the URL parameters after applying them
      // This prevents them from being applied again on refresh
      // We use replaceState to avoid adding a new entry to the browser history
      if (window.history && window.history.replaceState) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [searchParams, updateSettings, setFocusNumber, settings]);

  // Synchronize local state with global settings whenever settings change
  useEffect(() => {
    setSelectedOperation(settings.operation);
    setRange1Min(settings.range.min1);
    setRange1Max(settings.range.max1);
    setRange2Min(settings.range.min2);
    setRange2Max(settings.range.max2);
    setNegativeNumbersEnabled(settings.allowNegatives || false);
    setLearnerModeEnabled(settings.learnerMode || false);
    setCustomNumberPadEnabled(settings.useCustomNumberPad || false);
    setTypingSpeedEnabled(settings.typingSpeedAdjustment || false);
  }, [settings]);
  useEffect(() => {
    if (useFocusNumber && focusNumberValue !== null) {
      setRange1Min(focusNumberValue);
      setRange1Max(focusNumberValue);
    }
  }, [useFocusNumber, focusNumberValue]);
  const parseOrDefault = (str: string, def: number) => {
    const val = parseInt(str);
    return !isNaN(val) ? val : def;
  };
  const handleOperationSelect = (operation: Operation) => {
    setSelectedOperation(operation);
    // Update global settings when operation changes
    updateSettings({
      operation
    });
  };
  const handleFocusNumberToggle = (checked: boolean) => {
    setUseFocusNumber(checked);
    if (!checked) {
      setFocusNumber(null);
      setRange1Min(1);
      setRange1Max(10);
      // Update global settings when focus number is toggled off
      updateSettings({
        focusNumber: null,
        range: {
          ...settings.range,
          min1: 1,
          max1: 10
        }
      });
    } else {
      setFocusNumber(focusNumberValue);
      setRange1Min(focusNumberValue);
      setRange1Max(focusNumberValue);
      // Update global settings when focus number is toggled on
      updateSettings({
        focusNumber: focusNumberValue,
        range: {
          ...settings.range,
          min1: focusNumberValue,
          max1: focusNumberValue
        }
      });
    }
  };
  const handleFocusNumberChange = (value: string) => {
    const numValue = parseOrDefault(value, focusNumberValue);
    setFocusNumberValue(numValue);
    if (useFocusNumber) {
      setFocusNumber(numValue);
      setRange1Min(numValue);
      setRange1Max(numValue);
      // Update global settings when focus number changes
      updateSettings({
        focusNumber: numValue,
        range: {
          ...settings.range,
          min1: numValue,
          max1: numValue
        }
      });
    }
  };
  const handleNegativeToggle = (checked: boolean) => {
    setNegativeNumbersEnabled(checked);
    // Update global settings when negative toggle changes
    updateSettings({
      allowNegatives: checked
    });
  };
  const handleLearnerModeToggle = (checked: boolean) => {
    setLearnerModeEnabled(checked);
    // Update global settings when learner mode changes
    updateSettings({
      learnerMode: checked
    });
  };
  const handleCustomNumberPadToggle = (checked: boolean) => {
    setCustomNumberPadEnabled(checked);
    // Update global settings
    updateSettings({
      useCustomNumberPad: checked
    });
  };
  const handleTypingSpeedToggle = (checked: boolean) => {
    setTypingSpeedEnabled(checked);
    // Update global settings
    updateSettings({
      typingSpeedAdjustment: checked
    });
  };

  // Update only the timer setting without altering other settings
  const handleTimerChange = (seconds: number) => {
    updateSettings({
      timerSeconds: seconds
    });
  };

  // Handle range changes
  const handleRange1MinChange = (value: string) => {
    const numValue = parseOrDefault(value, range1Min);
    setRange1Min(numValue);
    updateSettings({
      range: {
        ...settings.range,
        min1: numValue
      }
    });
  };
  const handleRange1MaxChange = (value: string) => {
    const numValue = parseOrDefault(value, range1Max);
    setRange1Max(numValue);
    updateSettings({
      range: {
        ...settings.range,
        max1: numValue
      }
    });
  };
  const handleRange2MinChange = (value: string) => {
    const numValue = parseOrDefault(value, range2Min);
    setRange2Min(numValue);
    updateSettings({
      range: {
        ...settings.range,
        min2: numValue
      }
    });
  };
  const handleRange2MaxChange = (value: string) => {
    const numValue = parseOrDefault(value, range2Max);
    setRange2Max(numValue);
    updateSettings({
      range: {
        ...settings.range,
        max2: numValue
      }
    });
  };
  const handleStartGame = () => {
    if (range1Max < range1Min || range2Max < range2Min) {
      alert('Maximum value must be greater than or equal to minimum value');
      return;
    }
    
    // Check if the user has reached their score save limit before starting the game
    if (isLoggedIn && planType === 'free' && hasSaveScoreLimitReached && hasSaveScoreLimitReached()) {
      console.log('User has reached score save limit, showing pre-game paywall');
      
      // Set this flag to false as we know the score can't be saved
      setCanSaveCurrentScore(false);
      
      // Show the paywall before starting the game
      setShowScoreSavePaywall(true);
      return;
    }
    
    // If we got here, we can save the score (either the user is not logged in, 
    // or they haven't reached their limit, or they have a premium plan)
    setCanSaveCurrentScore(true);
    
    // Continue with starting the game
    startGameProcess();
  };
  
  // Extract the game start process to a separate function so it can be called
  // after the paywall is dismissed or when starting normally
  const startGameProcess = () => {
    resetScore();
    updateSettings({
      operation: selectedOperation,
      range: {
        min1: useFocusNumber ? focusNumberValue : range1Min,
        max1: useFocusNumber ? focusNumberValue : range1Max,
        min2: range2Min,
        max2: range2Max
      },
      timerSeconds: settings.timerSeconds,
      allowNegatives: negativeNumbersEnabled,
      learnerMode: learnerModeEnabled,
      useCustomNumberPad: customNumberPadEnabled,
      typingSpeedAdjustment: typingSpeedEnabled,
      focusNumber: useFocusNumber ? focusNumberValue : null
    });
    
    if (useFocusNumber) {
      setFocusNumber(focusNumberValue);
    } else {
      setFocusNumber(null);
    }
    
    setTimeLeft(settings.timerSeconds);

    // Go to warmup-countdown first if typing speed adjustment is enabled
    if (typingSpeedEnabled) {
      setGameState('warmup-countdown');
    } else {
      // Go to countdown before playing
      setGameState('countdown');
    }
  };
  
  return <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg animate-fade-in mx-auto max-w-[535px] min-w-[300px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Timed Mental Math Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto space-y-6 px-0">
            <div>
              <h3 className="text-lg font-medium mb-3">Operation</h3>
              <div className="flex flex-nowrap justify-center items-center rounded-lg p-2 px-0 bg-muted/50 w-full">
                {(['addition', 'subtraction', 'multiplication', 'division'] as Operation[]).map(operation => <OperationButton key={operation} active={selectedOperation === operation} operation={operation} onClick={handleOperationSelect} isMobile={isMobile} />)}
              </div>
            </div>

            <NumberRangeSection focusNumberEnabled={useFocusNumber} focusNumber={focusNumberValue} negativeNumbersEnabled={negativeNumbersEnabled} range1={{
            min: range1Min,
            max: range1Max
          }} range2={{
            min: range2Min,
            max: range2Max
          }} setRange1Min={handleRange1MinChange} setRange1Max={handleRange1MaxChange} setRange2Min={handleRange2MinChange} setRange2Max={handleRange2MaxChange} />

            <TimerSelect value={settings.timerSeconds} onChange={handleTimerChange} />

            <AdvancedSettings useFocusNumber={useFocusNumber} focusNumberValue={focusNumberValue} negativeNumbersEnabled={negativeNumbersEnabled} learnerModeEnabled={learnerModeEnabled} customNumberPadEnabled={customNumberPadEnabled} typingSpeedEnabled={typingSpeedEnabled} onFocusNumberToggle={handleFocusNumberToggle} onFocusNumberChange={handleFocusNumberChange} onNegativeToggle={handleNegativeToggle} onLearnerModeToggle={handleLearnerModeToggle} onCustomNumberPadToggle={handleCustomNumberPadToggle} onTypingSpeedToggle={handleTypingSpeedToggle} />
          </div>
        </CardContent>
        <CardFooter className="px-4">
          <Button onClick={handleStartGame} className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 transition-all">
            Start Game
            <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>;
};
export default OperationSelection;
