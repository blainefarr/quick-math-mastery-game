
import { toast as sonnerToast } from "sonner";
import { useState } from "react";

// Maintain the structure similar to the original shadcn implementation
export const useToast = () => {
  const [toasts, setToasts] = useState<any[]>([]);

  const toast = (options: {
    title?: string;
    description?: string;
    action?: any;
    variant?: 'default' | 'destructive' | 'success';
  }) => {
    const id = Date.now().toString();
    
    // Use Sonner's toast methods based on variant
    switch(options.variant) {
      case 'success':
        sonnerToast.success(options.title, { description: options.description });
        break;
      case 'destructive':
        sonnerToast.error(options.title, { description: options.description });
        break;
      default:
        sonnerToast(options.title, { description: options.description });
    }

    const newToast = {
      id,
      ...options,
      open: true,
    };

    setToasts(currentToasts => [...currentToasts, newToast]);

    return {
      id,
      dismiss: () => {
        sonnerToast.dismiss(id);
        setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
      }
    };
  };

  return {
    toasts,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
        setToasts(currentToasts => currentToasts.filter(t => t.id !== toastId));
      } else {
        sonnerToast.dismiss();
        setToasts([]);
      }
    }
  };
};

export { sonnerToast as toast };
