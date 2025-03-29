
import React from 'react';
import { Heart, PenLine, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Memory } from './types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MemoryCardProps {
  memory: Memory;
  index: number;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, index, onEdit, onDelete }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className={`flex w-full ${isEven ? 'justify-start' : 'justify-end'} mb-12`}>
      <div 
        className="neu-element p-6 max-w-md animate-fade-in relative group transform transition-all duration-500 hover:shadow-lg hover:-translate-y-1" 
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(memory)}
          >
            <PenLine size={16} />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete memory</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{memory.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(memory.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="mb-2 text-sm text-muted-foreground">{memory.date}</div>
        <h3 className="text-xl font-semibold mb-2">{memory.title}</h3>
        <p className="text-foreground/80">{memory.description}</p>
        
        <div className="flex justify-end mt-4">
          <Heart size={18} className="text-primary animate-heart-beat" fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
