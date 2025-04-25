
// Re-export the toast functionality from sonner
import { toast } from "sonner";

// Export useToast for backward compatibility with any components using it
export const useToast = () => {
  return {
    toast,
    // Add any additional methods needed for compatibility
    dismiss: (toastId?: string) => toast.dismiss(toastId),
  };
};

export { toast };
