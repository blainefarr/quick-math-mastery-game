
import { toast } from 'sonner';

// Keep track of shown toasts to prevent duplicates
const shownToasts = new Set<string>();

// Time in ms to consider a toast as "cleared" for showing again
const TOAST_RESET_TIME = 3000;

/**
 * Shows a toast only once until its reset timer completes
 */
export function showToastOnce({ 
  id, 
  message, 
  type = 'default',
  duration = 5000
}: { 
  id: string; 
  message: string; 
  type?: 'success' | 'error' | 'info' | 'warning' | 'default';
  duration?: number;
}) {
  console.log(`Attempting to show toast: ${id}`);
  
  // Don't show if already displayed
  if (shownToasts.has(id)) {
    console.log(`Toast ${id} already shown, skipping`);
    return;
  }
  
  // Dismiss any existing toast with this ID
  toast.dismiss(id);
  
  // Show the toast based on type
  switch (type) {
    case 'success':
      toast.success(message, { id, duration });
      break;
    case 'error':
      toast.error(message, { id, duration });
      break;
    case 'info':
      // Sonner doesn't have an info method, using default with icon
      toast(message, { id, duration });
      break;
    case 'warning':
      toast.warning(message, { id, duration });
      break;
    default:
      toast(message, { id, duration });
  }
  
  // Track that this toast has been shown
  shownToasts.add(id);
  console.log(`Toast ${id} shown and added to tracking set`);
  
  // Remove from tracking after a delay to allow re-showing later
  setTimeout(() => {
    shownToasts.delete(id);
    console.log(`Toast ${id} removed from tracking set`);
  }, TOAST_RESET_TIME);
}
