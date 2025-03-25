
import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface AnniversaryAnimationProps {
  isAnniversaryDay: boolean;
}

const AnniversaryAnimation: React.FC<AnniversaryAnimationProps> = ({ isAnniversaryDay }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Show animation when it's the anniversary day
  useEffect(() => {
    if (isAnniversaryDay) {
      setShowAnimation(true);
      
      // Hide the animation after 15 seconds
      const timeout = setTimeout(() => {
        setShowAnimation(false);
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [isAnniversaryDay]);
  
  if (!showAnimation) return null;
  
  // Create an array of hearts with random positions and animations
  const hearts = Array.from({ length: 20 }, (_, i) => {
    const size = Math.random() * 30 + 10; // Random size between 10-40px
    const left = Math.random() * 100; // Random left position (0-100%)
    const animationDelay = Math.random() * 3; // Random delay up to 3s
    const animationDuration = Math.random() * 5 + 10; // Random duration between 10-15s
    
    return (
      <div 
        key={i}
        className="absolute animate-float"
        style={{
          left: `${left}%`,
          top: '-20px',
          animationDelay: `${animationDelay}s`,
          animationDuration: `${animationDuration}s`,
        }}
      >
        <Heart 
          size={size} 
          className="text-primary animate-heart-beat" 
          fill="currentColor"
        />
      </div>
    );
  });
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {hearts}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="neu-element bg-background/90 backdrop-blur-sm p-8 max-w-md text-center animate-scale-up">
          <h2 className="text-4xl font-bold text-primary mb-4">Happy Anniversary!</h2>
          <p className="text-xl mb-6">Celebrating another beautiful year together!</p>
          <Heart size={60} className="mx-auto text-primary animate-heart-beat" fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

export default AnniversaryAnimation;
