
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NegativeNumbersToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const NegativeNumbersToggle = ({
  enabled,
  onToggle
}: NegativeNumbersToggleProps) => (
  <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/50 h-[40px]">
    <div className="flex items-center space-x-2">
      <Label htmlFor="negative-number-toggle" className="text-sm">
        Include Negatives
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info size={16} className="text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Allow randomly chosen negative numbers in range inputs (question numbers may be negative).
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <Switch id="negative-number-toggle" checked={enabled} onCheckedChange={onToggle} />
  </div>
);

export default NegativeNumbersToggle;
