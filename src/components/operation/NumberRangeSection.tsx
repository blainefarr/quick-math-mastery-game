
import React from "react";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";

interface Props {
  focusNumberEnabled: boolean;
  focusNumber: number;
  negativeNumbersEnabled: boolean;
  range1: { min: number; max: number };
  range2: { min: number; max: number };
  setRange1Min: (v: string) => void;
  setRange1Max: (v: string) => void;
  setRange2Min: (v: string) => void;
  setRange2Max: (v: string) => void;
}

const NumberRangeSection = ({
  focusNumberEnabled, focusNumber, negativeNumbersEnabled,
  range1, range2, setRange1Min, setRange1Max, setRange2Min, setRange2Max
}: Props) => (
  <div className="space-y-4 mt-3">
    <h3 className="text-lg font-medium">Number Ranges</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className={`space-y-2 ${focusNumberEnabled ? 'opacity-50' : ''}`}>
        <Label htmlFor="range1">First Number Range:</Label>
        <div className="flex space-x-2">
          <div>
            <Label htmlFor="range1-min" className="text-sm">Min</Label>
            <Input
              id="range1-min"
              type="number"
              inputMode="tel"
              pattern="^-?\\d*$"
              value={range1.min}
              onChange={e => setRange1Min(e.target.value)}
              className="w-24"
              min={negativeNumbersEnabled ? -100 : 1}
              max={100}
              disabled={focusNumberEnabled}
            />
          </div>
          <div>
            <Label htmlFor="range1-max" className="text-sm">Max</Label>
            <Input
              id="range1-max"
              type="number"
              inputMode="tel"
              pattern="^-?\\d*$"
              value={range1.max}
              onChange={e => setRange1Max(e.target.value)}
              className="w-24"
              min={negativeNumbersEnabled ? -100 : 1}
              max={100}
              disabled={focusNumberEnabled}
            />
          </div>
        </div>
        {focusNumberEnabled && (
          <p className="text-xs text-muted-foreground">
            Using focus number {focusNumber} as first number
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
              inputMode="tel"
              pattern="^-?\\d*$"
              value={range2.min}
              onChange={e => setRange2Min(e.target.value)}
              className="w-24"
              min={negativeNumbersEnabled ? -100 : 1}
              max={100}
            />
          </div>
          <div>
            <Label htmlFor="range2-max" className="text-sm">Max</Label>
            <Input
              id="range2-max"
              type="number"
              inputMode="tel"
              pattern="^-?\\d*$"
              value={range2.max}
              onChange={e => setRange2Max(e.target.value)}
              className="w-24"
              min={negativeNumbersEnabled ? -100 : 1}
              max={100}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default NumberRangeSection;
