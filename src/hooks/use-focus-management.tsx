
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
  // Reduce max attempts and only retry on mobile
  const maxFocusAttempts = isMobile ? 3 : 1;

  // Simplified focus mechanism with fewer attempts
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
    
    // Only retry on mobile with reduced frequency
    if (isMobile && focusAttemptsMadeRef.current < maxFocusAttempts) {
      setTimeout(attemptFocus, 300);
    }
  };

  const focusInput = () => {
    // Reset the attempt counter to allow a fresh batch of focus attempts
    focusAttemptsMadeRef.current = 0;
    
    console.log('Manual focus triggered on input');
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
