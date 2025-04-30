import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useGame } from '@/context/useGame';
import { Operation } from '@/types';
import AdvancedSettings from './operation/AdvancedSettings';
import { useCompactHeight } from '@/hooks/use-compact-height';

interface NumberRange {
  min1: string;
  max1: string;
  min2: string;
  max2: string;
}

const OperationSelection = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, setGameState } = useGame();
  const { toast } = useToast();
  const isCompactHeight = useCompactHeight();

  const [operation, setOperation] = useState<Operation>(settings.operation || 'addition');
  const [numberRange, setNumberRange] = useState<NumberRange>({
    min1: String(settings.range.min1 || 1),
    max1: String(settings.range.max1 || 10),
    min2: String(settings.range.min2 || 1),
    max2: String(settings.range.max2 || 10),
  });
  const [selectedTimer, setSelectedTimer] = useState<number>(settings.timerSeconds || 60);
  const [useFocusNumber, setUseFocusNumber] = useState<boolean>(settings.focusNumber !== null);
  const [focusNumberValue, setFocusNumberValue] = useState<number>(settings.focusNumber || 7);
  const [negativeNumbersEnabled, setNegativeNumbersEnabled] = useState<boolean>(settings.allowNegatives || false);
  const [learnerModeEnabled, setLearnerModeEnabled] = useState<boolean>(settings.learnerMode || false);

  // Add customNumberPadEnabled state and handler
  const [customNumberPadEnabled, setCustomNumberPadEnabled] = useState<boolean>(
    settings.useCustomNumberPad || false
  );
  
  useEffect(() => {
    // Load settings from localStorage on component mount
    const savedOperation = localStorage.getItem('operation');
    const savedNumberRange = localStorage.getItem('numberRange');
    const savedTimer = localStorage.getItem('selectedTimer');
    const savedFocusNumber = localStorage.getItem('focusNumber');
    const savedUseFocusNumber = localStorage.getItem('useFocusNumber');
    const savedNegativeNumbers = localStorage.getItem('negativeNumbersEnabled');
    const savedLearnerMode = localStorage.getItem('learnerModeEnabled');
    const savedCustomNumberPad = localStorage.getItem('customNumberPadEnabled');

    if (savedOperation) setOperation(savedOperation as Operation);
    if (savedNumberRange) setNumberRange(JSON.parse(savedNumberRange));
    if (savedTimer) setSelectedTimer(Number(savedTimer));
    if (savedUseFocusNumber) setUseFocusNumber(JSON.parse(savedUseFocusNumber));
    if (savedFocusNumber) setFocusNumberValue(Number(savedFocusNumber));
    if (savedNegativeNumbers) setNegativeNumbersEnabled(JSON.parse(savedNegativeNumbers));
    if (savedLearnerMode) setLearnerModeEnabled(JSON.parse(savedLearnerMode));
    if (savedCustomNumberPad) setCustomNumberPadEnabled(JSON.parse(savedCustomNumberPad));
  }, []);

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('operation', operation);
    localStorage.setItem('numberRange', JSON.stringify(numberRange));
    localStorage.setItem('selectedTimer', String(selectedTimer));
    localStorage.setItem('focusNumber', String(focusNumberValue));
    localStorage.setItem('useFocusNumber', JSON.stringify(useFocusNumber));
    localStorage.setItem('negativeNumbersEnabled', JSON.stringify(negativeNumbersEnabled));
    localStorage.setItem('learnerModeEnabled', JSON.stringify(learnerModeEnabled));
    localStorage.setItem('customNumberPadEnabled', JSON.stringify(customNumberPadEnabled));
  }, [operation, numberRange, selectedTimer, focusNumberValue, useFocusNumber, negativeNumbersEnabled, learnerModeEnabled, customNumberPadEnabled]);

  const handleOperationChange = (value: Operation) => {
    setOperation(value);
  };

  const handleNumberRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNumberRange(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTimerChange = (value: number[]) => {
    setSelectedTimer(value[0]);
  };

  const handleFocusNumberToggle = (checked: boolean) => {
    setUseFocusNumber(checked);
  };

  const handleFocusNumberChange = (value: string) => {
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setFocusNumberValue(parsedValue);
    }
  };

  const handleNegativeNumbersToggle = (checked: boolean) => {
    setNegativeNumbersEnabled(checked);
  };

  const handleLearnerModeToggle = (checked: boolean) => {
    setLearnerModeEnabled(checked);
  };
  
  const handleCustomNumberPadToggle = (checked: boolean) => {
    setCustomNumberPadEnabled(checked);
  };
  
  const validateRange = () => {
    const min1 = parseInt(numberRange.min1);
    const max1 = parseInt(numberRange.max1);
    const min2 = parseInt(numberRange.min2);
    const max2 = parseInt(numberRange.max2);

    if (isNaN(min1) || isNaN(max1) || isNaN(min2) || isNaN(max2)) {
      toast({
        title: "Error",
        description: "Please enter valid numbers for the number ranges.",
        variant: "destructive",
      });
      return false;
    }

    if (min1 > max1 || min2 > max2) {
      toast({
        title: "Error",
        description: "Minimum value cannot be greater than maximum value.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleStartGame = () => {
    if (!validateRange()) {
      return;
    }
    
    updateSettings({
      operation,
      range: {
        min1: parseInt(numberRange.min1),
        max1: parseInt(numberRange.max1),
        min2: parseInt(numberRange.min2),
        max2: parseInt(numberRange.max2),
      },
      timerSeconds: selectedTimer,
      allowNegatives: negativeNumbersEnabled,
      focusNumber: useFocusNumber ? focusNumberValue : null,
      learnerMode: learnerModeEnabled,
      useCustomNumberPad: customNumberPadEnabled
    });
    
    setGameState('playing');
  };

  const handleGoToGoals = () => {
    navigate('/goals');
  };

  return (
    <div className={`flex justify-center items-center min-h-screen p-4 bg-background ${
      isCompactHeight ? 'pt-0 mt-0' : 'pt-4'
    }`}>
      <div className={`w-full max-w-md ${
        isCompactHeight ? 'mt-0' : 'mt-8'
      }`}>
        <Card className="animate-in fade-in duration-700">
          <CardHeader>
            <CardTitle className="text-2xl">Math Game</CardTitle>
            <CardDescription>Select your operation and number range.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="operation">Operation</Label>
              <Select value={operation} onValueChange={handleOperationChange}>
                <SelectTrigger id="operation">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addition">Addition (+)</SelectItem>
                  <SelectItem value="subtraction">Subtraction (−)</SelectItem>
                  <SelectItem value="multiplication">Multiplication (×)</SelectItem>
                  <SelectItem value="division">Division (÷)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min1">Range 1 Min</Label>
                <Input
                  type="number"
                  id="min1"
                  name="min1"
                  value={numberRange.min1}
                  onChange={handleNumberRangeChange}
                />
              </div>
              <div>
                <Label htmlFor="max1">Range 1 Max</Label>
                <Input
                  type="number"
                  id="max1"
                  name="max1"
                  value={numberRange.max1}
                  onChange={handleNumberRangeChange}
                />
              </div>
              <div>
                <Label htmlFor="min2">Range 2 Min</Label>
                <Input
                  type="number"
                  id="min2"
                  name="min2"
                  value={numberRange.min2}
                  onChange={handleNumberRangeChange}
                />
              </div>
              <div>
                <Label htmlFor="max2">Range 2 Max</Label>
                <Input
                  type="number"
                  id="max2"
                  name="max2"
                  value={numberRange.max2}
                  onChange={handleNumberRangeChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timer">Timer (seconds)</Label>
              <Slider
                id="timer"
                defaultValue={[selectedTimer]}
                max={180}
                step={15}
                aria-label="Timer duration in seconds"
                onValueChange={handleTimerChange}
              />
              <p className="text-sm text-muted-foreground">
                Selected timer: {selectedTimer} seconds
              </p>
            </div>
          </CardContent>
        </Card>

        <AdvancedSettings
          useFocusNumber={useFocusNumber}
          focusNumberValue={focusNumberValue}
          negativeNumbersEnabled={negativeNumbersEnabled}
          learnerModeEnabled={learnerModeEnabled}
          customNumberPadEnabled={customNumberPadEnabled}
          onFocusNumberToggle={handleFocusNumberToggle}
          onFocusNumberChange={handleFocusNumberChange}
          onNegativeToggle={handleNegativeNumbersToggle}
          onLearnerModeToggle={handleLearnerModeToggle}
          onCustomNumberPadToggle={handleCustomNumberPadToggle}
        />

        <div className="flex justify-between mt-6">
          <Button onClick={handleStartGame}>Start Game</Button>
          <Button variant="secondary" onClick={handleGoToGoals}>View Goals</Button>
        </div>
      </div>
    </div>
  );
};

export default OperationSelection;
