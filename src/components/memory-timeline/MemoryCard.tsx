
import React from 'react';
import { Heart, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Memory } from './types';

interface MemoryCardProps {
  memory: Memory;
  index: number;
  onEdit: (memory: Memory) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, index, onEdit }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className={`flex w-full ${isEven ? 'justify-start' : 'justify-end'} mb-12`}>
      <div 
        className="neu-element p-6 max-w-md animate-fade-in relative group transform transition-all duration-500 hover:shadow-lg hover:-translate-y-1" 
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(memory)}
        >
          <PenLine size={16} />
        </Button>
        
        <div className="mb-2 text-sm text-muted-foreground">{memory.date}</div>
        <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
        <p className="text-foreground/80">{memory.description}</p>
        
        {memory.imageUrl && (
          <img 
            src={memory.imageUrl} 
            alt={memory.title} 
            className="w-full h-40 object-cover rounded-lg mt-4 transition-transform duration-500 hover:scale-105"
          />
        )}
        
        <div className="flex justify-end mt-4">
          <Heart size={18} className="text-primary animate-heart-beat" fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
