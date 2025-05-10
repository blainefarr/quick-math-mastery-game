
import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

interface UseGameInputProps {
  onCorrectAnswer: () => void;
  timeLeft: number;
  correctAnswer?: string | number | null;
  allowNegatives?: boolean;
  customNumberPadEnabled?: boolean;
}

export const useGameInput = ({
  onCorrectAnswer,
  timeLeft, 
  correctAnswer,
  allowNegatives = false,
  customNumberPadEnabled = false
}: UseGameInputProps) => {
  const [userInput, setUserInput] = useState('');
  const [isNegative, setIsNegative] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Track if the game has ended
  const hasEndedRef = useRef(false);
  // Track focus attempts
  const focusAttemptsMadeRef = useRef(0);
  const maxFocusAttempts = 10;

  // Check if game has ended based on time left
  useEffect(() => {
    hasEndedRef.current = timeLeft <= 0;
  }, [timeLeft]);

  // Improved focus mechanism with multiple attempts
  const attemptFocus = () => {
    if (hasEndedRef.current || focusAttemptsMadeRef.current >= maxFocusAttempts) return;
    
    if (inputRef.current) {
      console.log(`Focus attempt ${focusAttemptsMadeRef.current + 1} for input`);
      inputRef.current.focus();
      
      // Force scroll to input on mobile
      if (isMobile) {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      focusAttemptsMadeRef.current++;
    }
    
    // Continue trying to focus if not at max attempts
    if (focusAttemptsMadeRef.current < maxFocusAttempts) {
      setTimeout(attemptFocus, isMobile ? 300 : 150);
    }
  };

  // Start focus attempts
  const focusInput = () => {
    if (hasEndedRef.current) return;
    
    // Reset the attempt counter to allow a fresh batch of focus attempts
    focusAttemptsMadeRef.current = 0;
    
    console.log('Manual focus triggered on input - beginning focus attempts');
    attemptFocus();
  };
  
  // Effect for initial focus
  useEffect(() => {
    // Reset focus attempts counter on mount
    focusAttemptsMadeRef.current = 0;
    
    // Initial delay before starting focus attempts - increased for better reliability
    const initialDelay = isMobile ? 1000 : 500;
    
    console.log(`Setting initial focus delay of ${initialDelay}ms`);
    setTimeout(attemptFocus, initialDelay);
    
    return () => {
      // Reset focus attempts on unmount
      focusAttemptsMadeRef.current = 0;
    };
  }, []);

  // Process a correct answer with feedback
  const processCorrectAnswer = () => {
    if (hasEndedRef.current) return;
    
    // Show feedback
    setFeedback('correct');
    
    // Use setTimeout to allow the UI to update before calling the handler
    setTimeout(() => {
      // Call the correct answer handler
      onCorrectAnswer();
      
      // Clear feedback and input after a brief delay
      setTimeout(() => {
        setUserInput('');
        setFeedback(null);
        setIsNegative(false);
      }, 100);
    }, 250);
  };

  // Handle keyboard input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanValue = rawValue.replace(/^-/, '');
    
    setUserInput(cleanValue);

    if (hasEndedRef.current) {
      console.log('Game has ended, not processing input');
      return;
    }

    // Check if answer is correct
    if (correctAnswer !== undefined && correctAnswer !== null && cleanValue.trim() !== "") {
      const numericValue = isNegative ? -Number(cleanValue) : Number(cleanValue);
      
      // Convert both to strings for comparison to handle both number and string correct answers
      if (numericValue.toString() === correctAnswer.toString()) {
        processCorrectAnswer();
      }
    }
  };

  // Handle number pad input
  const handleNumberPress = (number: string) => {
    if (hasEndedRef.current) return;
    
    const newInput = userInput + number;
    setUserInput(newInput);
    
    // Check if answer is correct
    if (correctAnswer !== undefined && correctAnswer !== null) {
      const numericValue = isNegative ? -Number(newInput) : Number(newInput);
      
      if (numericValue.toString() === correctAnswer.toString()) {
        // Use setTimeout to allow the UI to update before showing feedback
        setTimeout(() => {
          processCorrectAnswer();
        }, 10);
      }
    }
  };

  // Handle delete button on number pad
  const handleDelete = () => {
    if (hasEndedRef.current) return;
    setUserInput(prev => prev.slice(0, -1));
  };

  // Toggle negative value
  const toggleNegative = () => {
    if (!hasEndedRef.current) {
      setIsNegative(!isNegative);
      focusInput();
    }
  };

  // Container touch handler for better mobile focus
  const handleContainerTouch = () => {
    console.log('Container touched - attempting to focus input');
    focusInput();
    
    // For iOS devices, we also click the input directly as a fallback
    if (inputRef.current && isMobile) {
      inputRef.current.click();
    }
  };

  return {
    userInput,
    setUserInput,
    isNegative,
    setIsNegative,
    feedback,
    setFeedback,
    inputRef,
    focusInput,
    handleInputChange,
    handleNumberPress,
    handleDelete,
    toggleNegative,
    handleContainerTouch
  };
};
