
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { TooltipProvider, TooltipWrapper } from "@/components/ui/tooltip";

interface LearnerModeToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const LearnerModeToggle = ({
  enabled,
  onToggle
}: LearnerModeToggleProps) => {
  const tooltipContent = "Supports learning by showing answers after a pause and reinforcing with a retry.";

  return (
    <div className="flex items-center justify-between h-10 px-4 border rounded-md bg-muted/50">
      <div className="flex items-center gap-2 overflow-hidden">
        <Label htmlFor="learner-mode-toggle" className="text-sm whitespace-nowrap">
          Learner Mode
        </Label>
        
        <TooltipWrapper content={<p className="max-w-xs">{tooltipContent}</p>}>
          <Info size={16} className="text-muted-foreground flex-shrink-0" />
        </TooltipWrapper>
      </div>
      <Switch id="learner-mode-toggle" checked={enabled} onCheckedChange={onToggle} className="flex-shrink-0" />
    </div>
  );
};

export default LearnerModeToggle;
