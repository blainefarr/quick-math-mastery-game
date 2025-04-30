import React, { useState, useEffect } from 'react';
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

const OperationSelection = () => {
  const isMobile = useIsMobile();
  const {
    settings,
    updateSettings,
    setGameState,
    setTimeLeft,
    focusNumber,
    setFocusNumber,
    resetScore
  } = useGame();
  
  // Local state for form values
  const [selectedOperation, setSelectedOperation] = useState<Operation>(settings.operation);
  const [negativeNumbersEnabled, setNegativeNumbersEnabled] = useState(settings.allowNegatives || false);
  const [learnerModeEnabled, setLearnerModeEnabled] = useState(settings.learnerMode || false);
  const [customNumberPadEnabled, setCustomNumberPadEnabled] = useState(settings.useCustomNumberPad || false);
  const [range1Min, setRange1Min] = useState(settings.range.min1);
  const [range1Max, setRange1Max] = useState(settings.range.max1);
  const [range2Min, setRange2Min] = useState(settings.range.min2);
  const [range2Max, setRange2Max] = useState(settings.range.max2);
  const [useFocusNumber, setUseFocusNumber] = useState(focusNumber !== null);
  const [focusNumberValue, setFocusNumberValue] = useState(focusNumber || 1);
  
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
      focusNumber: useFocusNumber ? focusNumberValue : null
    });
    if (useFocusNumber) setFocusNumber(focusNumberValue);else setFocusNumber(null);
    setTimeLeft(settings.timerSeconds);
    setGameState('playing');
  };
  
  return <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg animate-fade-in mx-auto max-w-[535px] min-w-[300px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Minute Math Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto space-y-6 px-0">
            <div>
              <h3 className="text-lg font-medium mb-3">Operation</h3>
              <div className="flex flex-nowrap justify-center items-center rounded-lg p-2 px-0 bg-muted/50 w-full">
                {(['addition', 'subtraction', 'multiplication', 'division'] as Operation[]).map(operation => <OperationButton key={operation} active={selectedOperation === operation} operation={operation} onClick={handleOperationSelect} isMobile={isMobile} />)}
              </div>
            </div>

            <NumberRangeSection 
              focusNumberEnabled={useFocusNumber} 
              focusNumber={focusNumberValue} 
              negativeNumbersEnabled={negativeNumbersEnabled} 
              range1={{
                min: range1Min,
                max: range1Max
              }} 
              range2={{
                min: range2Min,
                max: range2Max
              }} 
              setRange1Min={handleRange1MinChange}
              setRange1Max={handleRange1MaxChange}
              setRange2Min={handleRange2MinChange}
              setRange2Max={handleRange2MaxChange}
            />

            <TimerSelect value={settings.timerSeconds} onChange={handleTimerChange} />

            <AdvancedSettings 
              useFocusNumber={useFocusNumber} 
              focusNumberValue={focusNumberValue} 
              negativeNumbersEnabled={negativeNumbersEnabled}
              learnerModeEnabled={learnerModeEnabled}
              customNumberPadEnabled={customNumberPadEnabled}
              onFocusNumberToggle={handleFocusNumberToggle} 
              onFocusNumberChange={handleFocusNumberChange} 
              onNegativeToggle={handleNegativeToggle}
              onLearnerModeToggle={handleLearnerModeToggle}
              onCustomNumberPadToggle={handleCustomNumberPadToggle}
            />
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
