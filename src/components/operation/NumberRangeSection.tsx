
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NumberRangeSectionProps {
  focusNumberEnabled?: boolean;
  focusNumber?: number;
  range1?: {
    min: number;
    max: number;
  };
  range2?: {
    min: number;
    max: number;
  };
  setRange1Min?: (value: any) => void;
  setRange1Max?: (value: any) => void;
  setRange2Min?: (value: any) => void;
  setRange2Max?: (value: any) => void;
  timeLimit?: number;
  onTimeChange?: (value: string) => void;
}

const NumberRangeSection = ({
  focusNumberEnabled,
  focusNumber,
  range1,
  range2,
  setRange1Min,
  setRange1Max,
  setRange2Min,
  setRange2Max,
  timeLimit,
  onTimeChange
}: NumberRangeSectionProps) => {
  const selectAllOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  if (!range1 || !range2 || !setRange1Min || !setRange1Max || !setRange2Min || !setRange2Max) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap md:flex-nowrap gap-8 px-4">
        <div className="flex-1 min-w-[240px]">
          <h4 className="text-base font-medium mb-2">Number Range 1</h4>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium block mb-1">Min</label>
                <input 
                  value={focusNumberEnabled ? focusNumber : range1.min}
                  onChange={e => setRange1Min(e.target.value)}
                  onFocus={selectAllOnFocus}
                  disabled={focusNumberEnabled}
                  className={`w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${focusNumberEnabled ? 'bg-muted text-muted-foreground' : ''}`}
                  type="number" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium block mb-1">Max</label>
                <input 
                  value={focusNumberEnabled ? focusNumber : range1.max}
                  onChange={e => setRange1Max(e.target.value)}
                  onFocus={selectAllOnFocus}
                  disabled={focusNumberEnabled}
                  className={`w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${focusNumberEnabled ? 'bg-muted text-muted-foreground' : ''}`}
                  type="number" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                />
              </div>
            </div>
            {focusNumberEnabled && (
              <p className="text-sm text-muted-foreground mt-1">
                (locked to focus number)
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-[240px]">
          <h4 className="text-base font-medium mb-2">Number Range 2</h4>
          <div className="flex flex-row gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium block mb-1">Min</label>
              <input 
                value={range2.min}
                onChange={e => setRange2Min(e.target.value)}
                onFocus={selectAllOnFocus}
                className="w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number" 
                inputMode="numeric" 
                pattern="[0-9]*" 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium block mb-1">Max</label>
              <input 
                value={range2.max}
                onChange={e => setRange2Max(e.target.value)}
                onFocus={selectAllOnFocus}
                className="w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                type="number" 
                inputMode="numeric" 
                pattern="[0-9]*" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium">Time Limit</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={16} className="text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose how long each round lasts</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={timeLimit?.toString()} onValueChange={onTimeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 seconds</SelectItem>
            <SelectItem value="30">30 seconds</SelectItem>
            <SelectItem value="60">1 minute</SelectItem>
            <SelectItem value="120">2 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default NumberRangeSection;
