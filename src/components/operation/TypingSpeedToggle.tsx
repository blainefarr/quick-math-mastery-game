
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TooltipWrapper } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TypingSpeedToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const TypingSpeedToggle = ({
  enabled,
  onToggle
}: TypingSpeedToggleProps) => {
  const isMobile = useIsMobile();
  
  const tooltipContent = "Includes a 15-second typing warmup phase to better measure math skills separately from typing speed";

  return (
    <div className="flex items-center justify-between h-10 px-4 border rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <Label htmlFor="typing-speed-adjustment" className="text-sm font-medium cursor-pointer">
          Typing Speed Adjustment
        </Label>
        
        <TooltipWrapper content={<p className="max-w-xs">{tooltipContent}</p>}>
          <Info className="h-4 w-4 text-muted-foreground" />
        </TooltipWrapper>
      </div>
      <Switch id="typing-speed-adjustment" checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
};

export default TypingSpeedToggle;
