
import { useRef, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

interface UseFocusManagementOptions {
  inputRef: React.RefObject<HTMLInputElement>;
  hasEnded: boolean;
  onFocus?: () => void;
}

export function useFocusManagement({
  inputRef,
  hasEnded,
  onFocus
}: UseFocusManagementOptions) {
  const isMobile = useIsMobile();
  const focusAttemptsMadeRef = useRef(0);
  const maxFocusAttempts = 10;

  // Enhanced focus mechanism with multiple attempts
  const attemptFocus = () => {
    if (hasEnded || focusAttemptsMadeRef.current >= maxFocusAttempts) return;
    
    if (inputRef.current) {
      console.log(`Focus attempt ${focusAttemptsMadeRef.current + 1} for input`);
      inputRef.current.focus();
      
      // Force scroll to input on mobile
      if (isMobile) {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      focusAttemptsMadeRef.current++;
      
      if (onFocus) {
        onFocus();
      }
    }
    
    // Continue trying to focus if not at max attempts with adaptive timing
    if (focusAttemptsMadeRef.current < maxFocusAttempts) {
      setTimeout(attemptFocus, isMobile ? 300 : 150);
    }
  };

  const focusInput = () => {
    // Reset the attempt counter to allow a fresh batch of focus attempts
    focusAttemptsMadeRef.current = 0;
    
    console.log('Manual focus triggered on input - beginning focus attempts');
    attemptFocus();
  };

  const resetFocusAttempts = () => {
    focusAttemptsMadeRef.current = 0;
  };

  // Clean up function for useEffect
  const cleanupFocus = () => {
    focusAttemptsMadeRef.current = 0;
  };

  return {
    focusInput,
    attemptFocus,
    resetFocusAttempts,
    cleanupFocus,
    isMobile
  };
}
