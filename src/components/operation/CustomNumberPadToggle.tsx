
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Laptop } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface CustomNumberPadToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const CustomNumberPadToggle = ({ enabled, onToggle }: CustomNumberPadToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Laptop size={18} className="text-muted-foreground" />
        <div>
          <Label htmlFor="custom-number-pad" className="text-sm font-medium">
            Use custom number pad
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <p className="text-xs text-muted-foreground">
                      Enables on-screen number pad
                    </p>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 text-sm">
                    Use our number pad for easier responses on devices like iPads
                  </HoverCardContent>
                </HoverCard>
              </TooltipTrigger>
              <TooltipContent className="hidden md:block">
                Use our number pad for easier responses on devices like iPads
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Switch
        id="custom-number-pad"
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
};

export default CustomNumberPadToggle;
