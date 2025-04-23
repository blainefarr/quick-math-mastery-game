
import * as React from "react"
import { cn } from "@/lib/utils"
import { Plus, Minus } from "lucide-react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  toggleNegative?: boolean;
  isNegative?: boolean;
  onToggleNegative?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, toggleNegative, isNegative, onToggleNegative, ...props }, ref) => {
    // Special handling for number inputs to work better on mobile
    const inputProps = type === "number"
      ? {
          inputMode: "tel" as React.HTMLAttributes<HTMLInputElement>["inputMode"],
          pattern: "^-?\\d*$",
          ...props
        }
      : props;

    return (
      <div className={toggleNegative ? "relative flex items-center" : undefined}>
        {toggleNegative && (
          <button
            type="button"
            onClick={onToggleNegative}
            className="absolute left-2 flex items-center justify-center h-6 w-6 rounded-full bg-muted z-10"
            aria-label={isNegative ? "Make positive" : "Make negative"}
          >
            {isNegative ? <Plus size={14} /> : <Minus size={14} />}
          </button>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&[type='number']]:appearance-textfield",
            toggleNegative && "pl-9",
            className
          )}
          ref={ref}
          {...inputProps}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input }
