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

const OperationSelection = () => {
  const {
    settings,
    updateSettings,
    setGameState,
    setTimeLeft,
    focusNumber,
    setFocusNumber,
    resetScore
  } = useGame();
  
  const [selectedOperation, setSelectedOperation] = useState<Operation>(settings.operation);
  const [negativeNumbersEnabled, setNegativeNumbersEnabled] = useState(false);
  const [range1Min, setRange1Min] = useState(settings.range.min1);
  const [range1Max, setRange1Max] = useState(settings.range.max1);
  const [range2Min, setRange2Min] = useState(settings.range.min2);
  const [range2Max, setRange2Max] = useState(settings.range.max2);
  const [useFocusNumber, setUseFocusNumber] = useState(focusNumber !== null);
  const [focusNumberValue, setFocusNumberValue] = useState(focusNumber || 1);
  
  useEffect(() => {
    setSelectedOperation(settings.operation);
    setRange1Min(settings.range.min1);
    setRange1Max(settings.range.max1);
    setRange2Min(settings.range.min2);
    setRange2Max(settings.range.max2);
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
  
  const handleOperationSelect = (operation: Operation) => setSelectedOperation(operation);
  
  const handleFocusNumberToggle = (checked: boolean) => {
    setUseFocusNumber(checked);
    if (!checked) {
      setFocusNumber(null);
      setRange1Min(1);
      setRange1Max(10);
    } else {
      setFocusNumber(focusNumberValue);
      setRange1Min(focusNumberValue);
      setRange1Max(focusNumberValue);
    }
  };
  
  const handleFocusNumberChange = (value: string) => {
    const numValue = parseOrDefault(value, focusNumberValue);
    setFocusNumberValue(numValue);
    if (useFocusNumber) {
      setFocusNumber(numValue);
      setRange1Min(numValue);
      setRange1Max(numValue);
    }
  };
  
  const handleNegativeToggle = (checked: boolean) => setNegativeNumbersEnabled(checked);
  
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
      focusNumber: useFocusNumber ? focusNumberValue : null
    });
    
    if (useFocusNumber) setFocusNumber(focusNumberValue);
    else setFocusNumber(null);
    
    setTimeLeft(settings.timerSeconds);
    setGameState('playing');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="shadow-lg animate-fade-in max-w-[650px] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Minute Math Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Operation</h3>
              <div className="flex flex-wrap gap-3 justify-center items-center rounded-lg p-2 bg-muted/50">
                {(['addition', 'subtraction', 'multiplication', 'division'] as Operation[]).map(operation => (
                  <OperationButton 
                    key={operation} 
                    active={selectedOperation === operation} 
                    operation={operation} 
                    onClick={handleOperationSelect} 
                  />
                ))}
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
              setRange1Min={v => setRange1Min(parseOrDefault(v, range1Min))}
              setRange1Max={v => setRange1Max(parseOrDefault(v, range1Max))}
              setRange2Min={v => setRange2Min(parseOrDefault(v, range2Min))}
              setRange2Max={v => setRange2Max(parseOrDefault(v, range2Max))}
            />

            <TimerSelect 
              value={settings.timerSeconds}
              onChange={(seconds) => updateSettings({ timerSeconds: seconds })}
            />

            <AdvancedSettings
              useFocusNumber={useFocusNumber}
              focusNumberValue={focusNumberValue}
              negativeNumbersEnabled={negativeNumbersEnabled}
              onFocusNumberToggle={handleFocusNumberToggle}
              onFocusNumberChange={handleFocusNumberChange}
              onNegativeToggle={handleNegativeToggle}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleStartGame} 
            className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 transition-all"
          >
            Start Game
            <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OperationSelection;
