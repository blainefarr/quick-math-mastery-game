
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';

interface CustomNumberPadToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const CustomNumberPadToggle = ({
  enabled,
  onToggle
}: CustomNumberPadToggleProps) => {
  return <div className="flex items-center justify-between h-10 px-4 border rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <Label htmlFor="custom-number-pad" className="text-sm font-medium cursor-pointer">
          Use Custom Number Pad
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Use our number pad for easier responses on mobile and tablet devices</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Switch id="custom-number-pad" checked={enabled} onCheckedChange={onToggle} />
    </div>;
};

export default CustomNumberPadToggle;
