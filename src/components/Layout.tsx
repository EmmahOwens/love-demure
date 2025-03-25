
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
        <div className="flex items-center justify-center mb-2">
          <Heart size={24} className="text-primary mr-2 animate-heart-beat" fill="currentColor" />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Our Love Story
          </h1>
          <Heart size={24} className="text-primary ml-2 animate-heart-beat" fill="currentColor" />
        </div>
        <p className="text-muted-foreground text-lg mt-2">
          Celebrating our journey together
        </p>
      </header>
      
      <main className="container px-4 mx-auto">
        {children}
      </main>
      
      <footer className="mt-20 py-6 text-center text-sm text-muted-foreground">
        <p>Made with love for our journey that began on May 20th</p>
      </footer>
    </div>
  );
};

export default Layout;
