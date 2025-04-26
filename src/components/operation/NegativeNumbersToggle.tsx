
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
  <div className="flex items-center justify-between h-10 px-4 border rounded-md bg-muted/50">
    <div className="flex items-center gap-2 overflow-hidden">
      <Label htmlFor="negative-number-toggle" className="text-sm whitespace-nowrap">
        Include Negatives
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info size={16} className="text-muted-foreground flex-shrink-0" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Allow randomly chosen negative numbers in range inputs (question numbers may be negative).
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <Switch id="negative-number-toggle" checked={enabled} onCheckedChange={onToggle} className="flex-shrink-0" />
  </div>
);

export default NegativeNumbersToggle;
