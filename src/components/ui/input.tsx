
import * as React from "react"
import { cn } from "@/lib/utils"
import { Plus, Minus } from "lucide-react"
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  toggleNegative?: boolean;
  isNegative?: boolean;
  onToggleNegative?: () => void;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", toggleNegative, isNegative, onToggleNegative, ...props }, ref) => {
    // Remove browser number spinners and use numeric keyboard on mobile
    return (
      <div className={toggleNegative ? "relative flex items-center" : undefined}>
        {toggleNegative && (
          <button
            type="button"
            onClick={onToggleNegative}
            className="absolute left-2 flex items-center justify-center h-6 w-6 rounded-full bg-muted z-10"
            aria-label={isNegative ? "Make positive" : "Make negative"}
            tabIndex={-1}
          >
            {isNegative ? <Plus size={14} /> : <Minus size={14} />}
          </button>
        )}
        <input
          type={type}
          inputMode={type === "number" || type === "text" ? "numeric" : undefined}
          pattern={type === "number" || type === "text" ? "[0-9]*" : undefined}
          // Prevent up/down arrows
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            toggleNegative && "pl-9",
            "appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input }
