
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TooltipWrapper } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CustomNumberPadToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const CustomNumberPadToggle = ({
  enabled,
  onToggle
}: CustomNumberPadToggleProps) => {
  const isMobile = useIsMobile();
  
  const tooltipContent = isMobile 
    ? "Use our custom number pad for easier input on your device" 
    : "Use our custom number pad in addition to keyboard input";

  return (
    <div className="flex items-center justify-between h-10 px-4 border rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <Label htmlFor="custom-number-pad" className="text-sm font-medium cursor-pointer">
          Use Custom Number Pad
        </Label>
        
        <TooltipWrapper content={<p className="max-w-xs">{tooltipContent}</p>}>
          <Info className="h-4 w-4 text-muted-foreground" />
        </TooltipWrapper>
      </div>
      <Switch id="custom-number-pad" checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
};

export default CustomNumberPadToggle;
