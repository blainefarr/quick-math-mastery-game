
import React, { useState, useEffect } from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Operation } from '@/types';
import OperationButton from './operation/OperationButton';
import FocusNumberSection from './operation/FocusNumberSection';
import NegativeNumbersToggle from './operation/NegativeNumbersToggle';
import NumberRangeSection from './operation/NumberRangeSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
  const [timerDuration, setTimerDuration] = useState(settings.timerSeconds);

  useEffect(() => {
    setSelectedOperation(settings.operation);
    setRange1Min(settings.range.min1);
    setRange1Max(settings.range.max1);
    setRange2Min(settings.range.min2);
    setRange2Max(settings.range.max2);
    setTimerDuration(settings.timerSeconds);
  }, [settings]);

  const parseOrDefault = (str: string, def: number) => {
    const val = parseInt(str);
    return !isNaN(val) ? val : def;
  };
  
  const handleOperationSelect = (operation: Operation) => setSelectedOperation(operation);
  
  const handleFocusNumberToggle = (checked: boolean) => {
    setUseFocusNumber(checked);
    if (!checked) {
      setFocusNumber(null);
    } else {
      setFocusNumber(focusNumberValue);
    }
  };
  
  const handleFocusNumberChange = (value: string) => {
    const numValue = parseOrDefault(value, focusNumberValue);
    setFocusNumberValue(numValue);
    if (useFocusNumber) setFocusNumber(numValue);
  };
  
  const handleNegativeToggle = (checked: boolean) => setNegativeNumbersEnabled(checked);
  
  const handleStartGame = () => {
    // If focus number is enabled, ensure range1 is set to the focus number
    const effectiveRange1Min = useFocusNumber ? focusNumberValue : range1Min;
    const effectiveRange1Max = useFocusNumber ? focusNumberValue : range1Max;

    // Check if the effective ranges are valid
    if (effectiveRange1Max < effectiveRange1Min || range2Max < range2Min) {
      alert('Maximum value must be greater than or equal to minimum value');
      return;
    }
    
    resetScore();
    updateSettings({
      operation: selectedOperation,
      range: {
        min1: effectiveRange1Min,
        max1: effectiveRange1Max,
        min2: range2Min,
        max2: range2Max
      },
      timerSeconds: timerDuration,
      allowNegatives: negativeNumbersEnabled,
      focusNumber: useFocusNumber ? focusNumberValue : null
    });
    
    if (useFocusNumber) setFocusNumber(focusNumberValue);
    else setFocusNumber(null);
    
    setTimeLeft(timerDuration);
    setGameState('playing');
  };
  
  return <div className="container mx-auto px-4 py-8 max-w-[650px]">
      <Card className="shadow-lg animate-fade-in max-w-[650px] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Minute Math Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Operation</h3>
            <div className="flex flex-wrap gap-3 justify-center items-center rounded-lg p-2 bg-muted/50 w-full">
              {(['addition', 'subtraction', 'multiplication', 'division'] as Operation[]).map(operation => <OperationButton key={operation} active={selectedOperation === operation} operation={operation} onClick={handleOperationSelect} />)}
            </div>
          </div>

          <FocusNumberSection enabled={useFocusNumber} value={focusNumberValue} onToggle={handleFocusNumberToggle} onChange={handleFocusNumberChange} />

          <NegativeNumbersToggle enabled={negativeNumbersEnabled} onToggle={handleNegativeToggle} />

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
          
          <div className="space-y-2 mt-2">
            <Label htmlFor="timer-select" className="text-lg font-medium">
              Timer Duration
            </Label>
            <Select value={String(timerDuration)} onValueChange={(value) => setTimerDuration(Number(value))}>
              <SelectTrigger id="timer-select" className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartGame} className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 transition-all">
            Start Game
            <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>;
};
export default OperationSelection;
