
import { useState, useRef } from 'react';

export type FeedbackType = 'correct' | 'incorrect' | null;

interface UseFeedbackManagementOptions {
  onFeedbackComplete?: () => void;
  feedbackDuration?: number;
}

export function useFeedbackManagement({
  onFeedbackComplete,
  feedbackDuration = 100 // Using a shorter feedback duration for consistency with game play
}: UseFeedbackManagementOptions = {}) {
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  const showFeedback = (type: FeedbackType, duration?: number) => {
    // Clear any existing feedback timeout
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    
    // Set the feedback
    setFeedback(type);
    
    // Set a timeout to clear feedback
    if (type !== null) {
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setFeedback(null);
        if (onFeedbackComplete) {
          onFeedbackComplete();
        }
      }, duration || feedbackDuration);
    }
  };

  const clearFeedback = () => {
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedback(null);
  };

  // Cleanup function for useEffect
  const cleanupFeedback = () => {
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
  };

  return {
    feedback,
    showFeedback,
    clearFeedback,
    cleanupFeedback
  };
}
