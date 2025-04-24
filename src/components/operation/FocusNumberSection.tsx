import React from 'react';
import { Info } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FocusNumberSectionProps {
  enabled: boolean;
  value: number;
  onToggle: (checked: boolean) => void;
  onChange: (value: string) => void;
}

const FocusNumberSection = ({
  enabled,
  value,
  onToggle,
  onChange
}: FocusNumberSectionProps) => (
  <div className="space-y-2 border p-4 rounded-lg bg-muted/50 py-[12px] my-0">
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
      <Switch id="focus-number-toggle" checked={enabled} onCheckedChange={onToggle} />
    </div>
    {enabled && (
      <div className="pt-2">
        <Label htmlFor="focus-number-input">Focus Number:</Label>
        <Input id="focus-number-input" type="number" inputMode="numeric" pattern="[0-9]*" value={value} onChange={e => onChange(e.target.value)} className="w-24 mt-1" min={1} />
        <p className="text-sm text-muted-foreground mt-2">
          All questions will include <span className="font-bold">{value}</span> as one of the numbers.
        </p>
      </div>
    )}
  </div>
);

export default FocusNumberSection;
