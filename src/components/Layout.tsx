
import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen pb-20">
      <ThemeToggle />
      
      <header className="pt-20 pb-10 text-center">
        <div className="flex items-center justify-center mb-4">
          <Heart 
            size={24} 
            className="text-primary mr-2 animate-pulse-soft hover:scale-110 transition-transform duration-300" 
            fill="currentColor" 
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Our Eternal Love Story
          </h1>
          <Heart 
            size={24} 
            className="text-primary ml-2 animate-pulse-soft hover:scale-110 transition-transform duration-300" 
            fill="currentColor" 
          />
        </div>
        <p className="text-muted-foreground text-lg mt-2 italic max-w-2xl mx-auto">
          Every moment with you is a verse in our beautiful love poem, written across the canvas of time with the ink of our shared dreams
        </p>
      </header>
      
      <main className="container px-4 mx-auto">
        {children}
      </main>
      
      <footer className="mt-20 py-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-muted-foreground/30" />
          <Heart size={14} className="text-primary/60" fill="currentColor" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-muted-foreground/30" />
        </div>
        <p>Crafted with endless love for our journey that bloomed on May 20th</p>
      </footer>
    </div>
  );
};

export default Layout;
