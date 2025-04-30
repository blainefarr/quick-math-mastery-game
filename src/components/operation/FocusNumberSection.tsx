
import React from 'react';
import { Info } from "lucide-react";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { useIsMobile } from '@/hooks/use-mobile';

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
}: FocusNumberSectionProps) => {
  const isMobile = useIsMobile();
  const [showMobileTooltip, setShowMobileTooltip] = React.useState(false);
  
  const tooltipContent = "When enabled, all questions will include this number as one of the operands.";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between h-10 px-4 border rounded-md bg-muted/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <Label htmlFor="focus-number-toggle" className="text-sm whitespace-nowrap">
            Use Focus Number
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={16} className="text-muted-foreground flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Switch id="focus-number-toggle" checked={enabled} onCheckedChange={onToggle} className="flex-shrink-0" />
      </div>

      {enabled && (
        <div className="pt-2 px-1">
          <Label htmlFor="focus-number-input">Focus Number:</Label>
          <Input 
            id="focus-number-input" 
            type="number" 
            inputMode="numeric" 
            pattern="[0-9]*" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-24 mt-1" 
            min={1} 
          />
          <p className="text-sm text-muted-foreground mt-2">
            All questions will include <span className="font-bold">{value}</span> as one of the numbers.
          </p>
        </div>
      )}
    </div>
  );
};

export default FocusNumberSection;
