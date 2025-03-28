
import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen pb-16 md:pb-20">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      <header className="pt-16 md:pt-20 pb-6 md:pb-10 text-center px-4">
        <div className="flex items-center justify-center mb-3 md:mb-4">
          <Heart 
            size={isMobile ? 18 : 24} 
            className="text-primary mr-2 animate-pulse-soft hover:scale-110 transition-transform duration-300" 
            fill="currentColor" 
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Our Eternal Love Story
          </h1>
          <Heart 
            size={isMobile ? 18 : 24}
            className="text-primary ml-2 animate-pulse-soft hover:scale-110 transition-transform duration-300" 
            fill="currentColor" 
          />
        </div>
        <p className="text-muted-foreground text-sm md:text-lg mt-2 italic max-w-xs sm:max-w-lg md:max-w-2xl mx-auto">
          Every moment with you is a verse in our beautiful love poem, written across the canvas of time with the ink of our shared dreams
        </p>
      </header>
      
      <main className="container px-4 mx-auto">
        {children}
      </main>
      
      <footer className="mt-16 md:mt-20 py-4 md:py-6 text-center text-xs md:text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-px w-12 md:w-16 bg-gradient-to-r from-transparent to-muted-foreground/30" />
          <Heart size={12} className="text-primary/60" fill="currentColor" />
          <div className="h-px w-12 md:w-16 bg-gradient-to-l from-transparent to-muted-foreground/30" />
        </div>
        <p>Crafted with endless love for our journey that bloomed on May 20th</p>
      </footer>
    </div>
  );
};

export default Layout;
