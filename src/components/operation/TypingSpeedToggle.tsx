
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TooltipProvider, TooltipWrapper } from "@/components/ui/tooltip";
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
  const [showMobileTooltip, setShowMobileTooltip] = React.useState(false);
  
  const tooltipContent = "Includes a 15-second typing warmup phase to better measure math skills separately from typing speed";

  return (
    <div className="flex items-center justify-between h-10 px-4 border rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <Label htmlFor="typing-speed-adjustment" className="text-sm font-medium cursor-pointer">
          Typing Speed Adjustment
        </Label>
        
        {isMobile ? (
          <div className="relative">
            <Info 
              size={16} 
              className="text-muted-foreground flex-shrink-0 cursor-pointer"
              onClick={() => setShowMobileTooltip(!showMobileTooltip)}
            />
            {showMobileTooltip && (
              <div className="absolute z-50 top-6 left-0 bg-popover p-2 rounded-md shadow-md text-xs w-48">
                {tooltipContent}
              </div>
            )}
          </div>
        ) : (
          <TooltipProvider>
            <TooltipWrapper content={<p className="max-w-xs">{tooltipContent}</p>}>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipWrapper>
          </TooltipProvider>
        )}
      </div>
      <Switch id="typing-speed-adjustment" checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
};

export default TypingSpeedToggle;
