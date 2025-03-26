
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const [lastClick, setLastClick] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only trigger hearts for clicks not on interactive elements
      if (!(e.target as HTMLElement).closest('button, a, input, textarea, select')) {
        const x = e.clientX;
        const y = e.clientY;
        setLastClick({ x, y });
        
        // Generate 3-5 hearts
        const numHearts = Math.floor(Math.random() * 3) + 3;
        const newHearts: FloatingHeart[] = [];
        
        for (let i = 0; i < numHearts; i++) {
          newHearts.push({
            id: Date.now() + i,
            x: x - 10 + Math.random() * 20, // Random offset
            y: y - 10 + Math.random() * 20,
            size: Math.floor(Math.random() * 14) + 8, // 8-22px
            duration: Math.random() * 2 + 1, // 1-3s
            delay: Math.random() * 0.3, // 0-0.3s
            opacity: Math.random() * 0.3 + 0.4, // 0.4-0.7
          });
        }
        
        setHearts([...hearts, ...newHearts]);
        
        // Remove hearts after animation
        setTimeout(() => {
          setHearts(prevHearts => prevHearts.filter(heart => 
            !newHearts.some(newHeart => newHeart.id === heart.id)
          ));
        }, 3000);
      }
    };
    
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [hearts]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {hearts.map(heart => (
        <Heart
          key={heart.id}
          size={heart.size}
          className="absolute text-primary"
          fill="currentColor"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            opacity: heart.opacity,
            animation: `floating ${heart.duration}s ease-out forwards ${heart.delay}s`,
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes floating {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: var(--opacity);
            }
            100% {
              transform: translate(${Math.random() > 0.5 ? '-' : ''}${Math.floor(Math.random() * 60) + 20}px, -${Math.floor(Math.random() * 100) + 50}px) rotate(${Math.random() > 0.5 ? '-' : ''}${Math.floor(Math.random() * 30)}deg);
              opacity: 0;
            }
          }
        `
      }} />
    </div>
  );
};

export default FloatingHearts;
