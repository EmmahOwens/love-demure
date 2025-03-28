
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
import { toast } from 'sonner';

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
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  
  // Try to load image from memory record or find it in storage
  React.useEffect(() => {
    const fetchImage = async () => {
      try {
        // If we already have a valid image URL in the memory record, use it
        if (memory.imageUrl && !imageError) {
          const preCheck = await checkImageUrl(memory.imageUrl);
          if (preCheck) {
            setImageUrl(memory.imageUrl);
            return;
          }
        }
        
        // Try to find a matching file in storage based on date
        if (memory.rawDate) {
          const formattedDate = memory.rawDate.toISOString().split('T')[0];
          
          // First, check if there are any files in the memories bucket
          const { data: files, error: filesError } = await supabase
            .storage
            .from('memories')
            .list();
            
          if (filesError) {
            console.warn('Error listing files in bucket:', filesError);
            return;
          }
          
          if (files && files.length > 0) {
            console.log(`Found ${files.length} files in memories bucket`);
            
            // Try to find files that might match this memory's date
            // This is a fallback approach as the exact file name might not be known
            for (const file of files) {
              // Get the public URL for the file
              const { data: publicUrlData } = supabase
                .storage
                .from('memories')
                .getPublicUrl(file.name);
              
              // Try to use this image
              const imgUrl = publicUrlData.publicUrl;
              const imgLoads = await checkImageUrl(imgUrl);
              
              if (imgLoads) {
                console.log(`Found working image for memory "${memory.title}": ${file.name}`);
                setImageUrl(imgUrl);
                
                // Update the memory in the database to cache this URL for next time
                if (memory.id) {
                  const { error: updateError } = await supabase
                    .from('memory_timeline')
                    .update({ image_url: imgUrl })
                    .eq('id', memory.id);
                  
                  if (updateError) {
                    console.error('Error updating memory with image URL:', updateError);
                  } else {
                    console.log(`Updated memory "${memory.title}" with image URL in database`);
                  }
                }
                
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error handling image lookup:', error);
      }
    };
    
    fetchImage();
  }, [memory, imageError]);
  
  // Helper to check if an image URL is valid and loads
  const checkImageUrl = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log(`Image pre-check successful: ${url}`);
        resolve(true);
      };
      img.onerror = () => {
        console.warn(`Image pre-check failed: ${url}`);
        resolve(false);
      };
      img.src = url;
    });
  };
  
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageError(false);
  };
  
  const handleImageError = () => {
    setImageError(true);
    setIsImageLoaded(false);
  };
  
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
        
        {imageUrl ? (
          <div className="w-full h-40 bg-muted/50 rounded-lg mt-4 overflow-hidden relative">
            {!isImageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
            
            <img 
              src={imageUrl} 
              alt={memory.title} 
              className={`w-full h-full object-cover rounded-lg transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'} ${isImageLoaded ? 'hover:scale-105' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Image not available</p>
              </div>
            )}
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
