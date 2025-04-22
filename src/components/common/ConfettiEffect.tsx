
import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  score: number;
}

const ConfettiEffect = ({ score }: ConfettiProps) => {
  const [pieces, setPieces] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    // Generate confetti pieces based on score
    const numPieces = Math.min(score * 5, 100); // Cap at 100 pieces
    const colors = ['#9b87f5', '#7E69AB', '#FEC6A1', '#FEF7CD', '#F2FCE2', '#D3E4FD'];
    
    const newPieces = Array.from({ length: numPieces }).map((_, i) => {
      const left = `${Math.random() * 100}%`;
      const top = `${Math.random() * 100}%`;
      const size = `${Math.random() * 0.5 + 0.5}rem`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = `rotate(${Math.random() * 360}deg)`;
      const animationDelay = `${Math.random() * 2}s`;
      
      return (
        <div 
          key={i}
          className="absolute rounded-sm animate-bounce-in opacity-0"
          style={{
            left,
            top,
            width: size,
            height: size,
            backgroundColor: color,
            transform: rotation,
            animationDelay,
            animationDuration: '1s',
            animationFillMode: 'forwards'
          }}
        />
      );
    });
    
    setPieces(newPieces);
    
    // Clean up after animation
    const timeout = setTimeout(() => {
      setPieces([]);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [score]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces}
    </div>
  );
};

export default ConfettiEffect;
