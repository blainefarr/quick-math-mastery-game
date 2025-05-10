
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { PopoverTooltip } from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Delay configuration for Tooltips
const DEFAULT_DELAY = { open: 300, close: 200 };

// Enhanced TooltipWrapper that adapts for mobile devices using popover instead
const TooltipWrapper = React.forwardRef<
  React.ElementRef<typeof Tooltip>,
  React.ComponentPropsWithoutRef<typeof Tooltip> & {
    content: React.ReactNode;
    children: React.ReactNode;
    delayDuration?: number;
  }
>(({ content, children, delayDuration = DEFAULT_DELAY.open, ...props }, ref) => {
  const isMobile = useIsMobile();

  // On mobile devices, use Popover instead of Tooltip for better touch interaction
  if (isMobile) {
    return (
      <PopoverTooltip content={content}>
        <div className="inline-flex cursor-pointer">
          {children}
        </div>
      </PopoverTooltip>
    );
  }

  // On desktop, use standard tooltip with hover
  return (
    <Tooltip delayDuration={delayDuration} {...props}>
      <TooltipTrigger asChild>
        <div className="inline-flex cursor-help">
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {content}
      </TooltipContent>
    </Tooltip>
  );
});
TooltipWrapper.displayName = 'TooltipWrapper';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipWrapper, DEFAULT_DELAY }
