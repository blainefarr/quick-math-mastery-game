
import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 pointer-events-auto",
        className
      )}
      // Mobile-friendly behavior with proper touch event handling
      onInteractOutside={(e) => {
        // Prevent dismissing when intentionally clicking inside
        if (props.onInteractOutside) {
          props.onInteractOutside(e);
        } else {
          e.preventDefault();
        }
      }}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// Add a mobile-friendly tooltip version of popover with consistent behavior
const PopoverTooltip = React.forwardRef<
  React.ElementRef<typeof Popover>,
  React.ComponentPropsWithoutRef<typeof Popover> & {
    content: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    align?: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>["align"];
    sideOffset?: number;
  }
>(({ content, children, className, contentClassName, align = "center", sideOffset = 4, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild onClick={() => setOpen(!open)} className={className}>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className={cn("w-64 p-3 text-sm", contentClassName)} 
        align={align}
        sideOffset={sideOffset}
        onInteractOutside={() => setOpen(false)}
        onPointerDownOutside={() => setOpen(false)}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
});
PopoverTooltip.displayName = 'PopoverTooltip';

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverTooltip }
