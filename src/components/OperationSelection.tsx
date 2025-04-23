
import React, { useState, useEffect } from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Info } from 'lucide-react';
import { Operation } from '@/types';
import MathIcon from './common/MathIcon';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from '@/hooks/use-mobile';

// Operation colors for clarity
const operationStyles = {
  addition: "bg-blue-200 border-2 border-blue-400 shadow font-bold text-primary",
  subtraction: "bg-green-200 border-2 border-green-400 shadow font-bold text-primary",
  multiplication: "bg-purple-200 border-2 border-purple-400 shadow font-bold text-primary",
  division: "bg-orange-200 border-2 border-orange-400 shadow font-bold text-primary",
};

const OperationSelection = () => {
  const {
    settings,
    updateSettings,
    setGameState,
    setTimeLeft,
    focusNumber,
    setFocusNumber,
    resetScore,
  } = useGame();

  const isMobile = useIsMobile();
  const [selectedOperation, setSelectedOperation] = useState<Operation>(settings.operation);
  const [range1Min, setRange1Min] = useState(settings.range.min1);
  const [range1Max, setRange1Max] = useState(settings.range.max1);
  const [range2Min, setRange2Min] = useState(settings.range.min2);
  const [range2Max, setRange2Max] = useState(settings.range.max2);
  const defaultTime = 60;
  const [useFocusNumber, setUseFocusNumber] = useState(focusNumber !== null);
  const [focusNumberValue, setFocusNumberValue] = useState(focusNumber || 1);

  useEffect(() => {
    setSelectedOperation(settings.operation);
    setRange1Min(settings.range.min1);
    setRange1Max(settings.range.max1);
    setRange2Min(settings.range.min2);
    setRange2Max(settings.range.max2);
  }, [settings]);

  const handleOperationSelect = (operation: Operation) => {
    setSelectedOperation(operation);
  };

  const handleRangeChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: string,
    min: number,
    max: number
  ) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      setter(numValue);
    }
  };

  const handleFocusNumberToggle = (checked: boolean) => {
    setUseFocusNumber(checked);
    if (!checked) {
      setFocusNumber(null);
    } else {
      setFocusNumber(focusNumberValue);
    }
  };

  const handleFocusNumberChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setFocusNumberValue(numValue);
      if (useFocusNumber) {
        setFocusNumber(numValue);
      }
    }
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
        min1: range1Min,
        max1: range1Max,
        min2: range2Min,
        max2: range2Max
      },
      timerSeconds: 60
    });

    if (useFocusNumber) {
      setFocusNumber(focusNumberValue);
    } else {
      setFocusNumber(null);
    }

    setTimeLeft(defaultTime);
    setGameState('playing');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Choose Your Math Challenge
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6">
          {/* OPERATION SELECTION - FLEX, RESPONSIVE */}
          <div>
            <h3 className="text-lg font-medium mb-3">Operation</h3>
            {/* Responsive flex row, wraps on xs/sm screens, consistent gap */}
            <div
              className="
                flex flex-wrap justify-center items-center gap-3
                rounded-lg p-2
                bg-muted/50
              "
              style={{
                minHeight: isMobile ? 64 : 56, marginBottom: isMobile ? 16 : 28
              }}
            >
              {(['addition', 'subtraction', 'multiplication', 'division'] as Operation[]).map((operation) => (
                <button
                  key={operation}
                  type="button"
                  aria-pressed={selectedOperation === operation}
                  onClick={() => handleOperationSelect(operation)}
                  className={`
                    flex items-center justify-center gap-2
                    px-4 py-2
                    rounded-lg
                    transition-all
                    font-semibold select-none
                    cursor-pointer
                    border-2
                    ${
                      selectedOperation === operation
                      ? operationStyles[operation]
                      : 'bg-white border-transparent text-muted-foreground shadow hover:bg-muted'
                    }
                    focus:outline-none focus:ring-2 focus:ring-primary
                  `}
                  style={{
                    minWidth: isMobile ? 68 : 96,
                    fontSize: isMobile ? '1.2rem' : '1.14rem'
                  }}
                >
                  <MathIcon operation={operation} size={22} className="mr-2" />
                  <span className="capitalize hidden xs:inline">
                    {operation.charAt(0).toUpperCase() + operation.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FOCUS NUMBER SECTION */}
          <div className="space-y-2 border p-4 rounded-lg bg-muted/50 mt-2 md:mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="focus-number-toggle" className="text-base font-medium">
                  Use Focus Number
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={16} className="text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        When enabled, all questions will include this number as one of the operands.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch
                id="focus-number-toggle"
                checked={useFocusNumber}
                onCheckedChange={handleFocusNumberToggle}
              />
            </div>
            {useFocusNumber && (
              <div className="pt-2">
                <Label htmlFor="focus-number-input">Focus Number:</Label>
                <Input
                  id="focus-number-input"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={focusNumberValue}
                  onChange={(e) => handleFocusNumberChange(e.target.value)}
                  className="w-24 mt-1"
                  min={1}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  All questions will include <span className="font-bold">{focusNumberValue}</span> as one of the numbers.
                </p>
              </div>
            )}
          </div>

          {/* NUMBER RANGES */}
          <div className="space-y-4 mt-3 md:mt-6">
            <h3 className="text-lg font-medium">Number Ranges</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`space-y-2 ${useFocusNumber ? 'opacity-50' : ''}`}>
                <Label htmlFor="range1">First Number Range:</Label>
                <div className="flex space-x-2">
                  <div>
                    <Label htmlFor="range1-min" className="text-sm">Min</Label>
                    <Input
                      id="range1-min"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={range1Min}
                      onChange={(e) => handleRangeChange(setRange1Min, e.target.value, 1, 100)}
                      className="w-24"
                      min={1}
                      max={100}
                      disabled={useFocusNumber}
                    />
                  </div>
                  <div>
                    <Label htmlFor="range1-max" className="text-sm">Max</Label>
                    <Input
                      id="range1-max"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={range1Max}
                      onChange={(e) => handleRangeChange(setRange1Max, e.target.value, 1, 100)}
                      className="w-24"
                      min={1}
                      max={100}
                      disabled={useFocusNumber}
                    />
                  </div>
                </div>
                {useFocusNumber && (
                  <p className="text-xs text-muted-foreground">
                    Using focus number {focusNumberValue} as first number
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="range2">Second Number Range:</Label>
                <div className="flex space-x-2">
                  <div>
                    <Label htmlFor="range2-min" className="text-sm">Min</Label>
                    <Input
                      id="range2-min"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={range2Min}
                      onChange={(e) => handleRangeChange(setRange2Min, e.target.value, 1, 100)}
                      className="w-24"
                      min={1}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="range2-max" className="text-sm">Max</Label>
                    <Input
                      id="range2-max"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={range2Max}
                      onChange={(e) => handleRangeChange(setRange2Max, e.target.value, 1, 100)}
                      className="w-24"
                      min={1}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TIMER */}
          <div className="space-y-2 mt-4 md:mt-6">
            <h3 className="text-lg font-medium">Timer</h3>
            <span className="block font-bold text-primary">60 seconds</span>
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

