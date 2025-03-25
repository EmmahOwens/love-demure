
import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { cn } from '@/lib/utils';

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

const ScrollRevealSection = ({
  children,
  className,
  delay = 0,
  direction = 'up'
}: ScrollRevealSectionProps) => {
  const { ref, isIntersecting } = useScrollReveal({
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    once: true
  });

  // Determine the initial transform based on direction
  const getInitialTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(50px)';
      case 'down': return 'translateY(-50px)';
      case 'left': return 'translateX(50px)';
      case 'right': return 'translateX(-50px)';
      case 'none': return 'none';
      default: return 'translateY(50px)';
    }
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(className)}
      style={{
        opacity: isIntersecting ? 1 : 0,
        transform: isIntersecting ? 'none' : getInitialTransform(),
        transition: `opacity 0.6s ease-out, transform 0.6s ease-out ${delay}ms`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
};

export default ScrollRevealSection;
