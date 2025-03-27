
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
import { supabase } from '@/integrations/supabase/client';

interface MemoryCardProps {
  memory: Memory;
  index: number;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, index, onEdit, onDelete }) => {
  const isEven = index % 2 === 0;
  const [imageError, setImageError] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(memory.imageUrl || null);
  
  // If there's an image URL in the database, use it directly
  // If not, check if there's a filename match in the memory_details table
  React.useEffect(() => {
    const fetchImage = async () => {
      // If we already have an image URL, use it
      if (memory.imageUrl) {
        setImageUrl(memory.imageUrl);
        return;
      }
      
      try {
        // Try to find a matching memory in memory_details by date
        if (memory.rawDate) {
          const formattedDate = memory.rawDate.toISOString().split('T')[0];
          
          // Query memory_details for entries with matching date
          const { data, error } = await supabase
            .from('memory_details')
            .select('*')
            .eq('date_taken', formattedDate + 'T00:00:00+00:00');
            
          if (error) {
            console.error('Error fetching memory details:', error);
            return;
          }
          
          // If we found a match, get its image URL
          if (data && data.length > 0) {
            console.log(`Found matching memory detail for ${memory.title} on ${formattedDate}:`, data[0]);
            
            const { data: publicUrlData } = supabase
              .storage
              .from('memories')
              .getPublicUrl(data[0].file_name);
              
            console.log(`Generated URL for ${data[0].file_name}:`, publicUrlData.publicUrl);
            
            setImageUrl(publicUrlData.publicUrl);
          }
        }
      } catch (error) {
        console.error('Error handling image lookup:', error);
      }
    };
    
    fetchImage();
  }, [memory]);
  
  // If there's an image, try to preload it to detect errors early
  React.useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onerror = () => {
        console.log(`Pre-loading image failed for memory "${memory.title}": ${imageUrl}`);
        setImageError(true);
      };
    }
  }, [imageUrl, memory.title]);
  
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
        
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={memory.title} 
            className="w-full h-40 object-cover rounded-lg mt-4 transition-transform duration-500 hover:scale-105"
            onError={() => {
              console.error("Memory image failed to load:", imageUrl);
              setImageError(true);
            }}
          />
        ) : imageUrl && imageError ? (
          <div className="w-full h-40 bg-muted flex items-center justify-center rounded-lg mt-4">
            <p className="text-muted-foreground text-sm">Image not available</p>
          </div>
        ) : null}
        
        <div className="flex justify-end mt-4">
          <Heart size={18} className="text-primary animate-heart-beat" fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
