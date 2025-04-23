import React, { useState, useEffect } from 'react';
import useGame from '@/context/useGame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Plus, Minus, X, Divide, Info } from 'lucide-react';
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

const operationColors = {
  addition: "bg-blue-200 text-primary font-bold shadow",
  subtraction: "bg-green-200 text-primary font-bold shadow",
  multiplication: "bg-purple-200 text-primary font-bold shadow",
  division: "bg-orange-200 text-primary font-bold shadow",
};

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
          <CardTitle className="text-2xl font-bold text-center">Choose Your Math Challenge</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="mb-10">
            <h3 className="text-lg font-medium mb-3">Operation</h3>
            <Tabs 
              defaultValue={selectedOperation} 
              value={selectedOperation}
              onValueChange={(value) => handleOperationSelect(value as Operation)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                <TabsTrigger
                  value="addition"
                  className={`flex items-center justify-center ${selectedOperation === "addition" ? operationColors.addition : ""}`}
                  aria-selected={selectedOperation === "addition"}
                >
                  <MathIcon operation="addition" className="mr-2" />
                  Addition
                </TabsTrigger>
                <TabsTrigger
                  value="subtraction"
                  className={`flex items-center justify-center ${selectedOperation === "subtraction" ? operationColors.subtraction : ""}`}
                  aria-selected={selectedOperation === "subtraction"}
                >
                  <MathIcon operation="subtraction" className="mr-2" />
                  Subtraction
                </TabsTrigger>
                <TabsTrigger
                  value="multiplication"
                  className={`flex items-center justify-center ${selectedOperation === "multiplication" ? operationColors.multiplication : ""}`}
                  aria-selected={selectedOperation === "multiplication"}
                >
                  <MathIcon operation="multiplication" className="mr-2" />
                  Multiplication
                </TabsTrigger>
                <TabsTrigger
                  value="division"
                  className={`flex items-center justify-center ${selectedOperation === "division" ? operationColors.division : ""}`}
                  aria-selected={selectedOperation === "division"}
                >
                  <MathIcon operation="division" className="mr-2" />
                  Division
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="space-y-2 border p-4 rounded-lg bg-muted/50 mt-6">
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
                  All questions will include {focusNumberValue} as one of the numbers.
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4 mt-6">
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
          
          <div className="space-y-2 mt-6">
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
