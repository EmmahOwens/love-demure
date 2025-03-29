
import React from 'react';
import { Heart, PenLine, Trash2, Image } from 'lucide-react';
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
  const [isRetrying, setIsRetrying] = React.useState(false);
  
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
        
        // If no valid imageUrl or it failed to load, try to find a matching file in storage
        await findMatchingImageInStorage();
      } catch (error) {
        console.error('Error handling image lookup:', error);
        setImageError(true);
      }
    };
    
    fetchImage();
  }, [memory, imageError]);
  
  // Helper to find a matching image in storage
  const findMatchingImageInStorage = async () => {
    try {
      // First, ensure bucket exists and is public
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'memories');
      
      if (!bucketExists) {
        console.warn('Memories bucket does not exist!');
        return;
      }
      
      // List all files in the memories bucket
      const { data: files, error: filesError } = await supabase
        .storage
        .from('memories')
        .list();
        
      if (filesError) {
        console.warn('Error listing files in bucket:', filesError);
        return;
      }
      
      if (!files || files.length === 0) {
        console.log('No files found in memories bucket');
        return;
      }
      
      console.log(`Found ${files.length} files in memories bucket`);
      
      // Look for files that match this memory by name or date
      let foundMatchingFile = false;
      
      // First try: Check if memory title matches any part of the filename
      if (memory.title) {
        const normalizedTitle = memory.title.toLowerCase().replace(/\s+/g, '');
        for (const file of files) {
          const normalizedFilename = file.name.toLowerCase().replace(/\s+/g, '');
          if (normalizedFilename.includes(normalizedTitle) || normalizedTitle.includes(normalizedFilename)) {
            const { data: publicUrlData } = supabase.storage.from('memories').getPublicUrl(file.name);
            const imgLoads = await checkImageUrl(publicUrlData.publicUrl);
            
            if (imgLoads) {
              console.log(`Found matching image by title: ${file.name} for memory "${memory.title}"`);
              setImageUrl(publicUrlData.publicUrl);
              foundMatchingFile = true;
              
              // Update the memory in DB with this URL
              if (memory.id) {
                await updateMemoryWithImageUrl(memory.id, publicUrlData.publicUrl);
              }
              
              break;
            }
          }
        }
      }
      
      // Second try: Check by date if we have rawDate
      if (!foundMatchingFile && memory.rawDate) {
        const memoryDate = memory.rawDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        for (const file of files) {
          const { data: publicUrlData } = supabase.storage.from('memories').getPublicUrl(file.name);
          const imgLoads = await checkImageUrl(publicUrlData.publicUrl);
          
          if (imgLoads) {
            console.log(`Found working image: ${file.name}, assigning to memory "${memory.title}"`);
            setImageUrl(publicUrlData.publicUrl);
            
            // Update the memory in the database
            if (memory.id) {
              await updateMemoryWithImageUrl(memory.id, publicUrlData.publicUrl);
            }
            
            return;
          }
        }
      }
      
      // Third try: Just grab the first valid image if nothing else worked
      if (!foundMatchingFile && !imageUrl) {
        for (const file of files) {
          if (file.name === '.emptyFolderPlaceholder') continue;
          
          const { data: publicUrlData } = supabase.storage.from('memories').getPublicUrl(file.name);
          const imgLoads = await checkImageUrl(publicUrlData.publicUrl);
          
          if (imgLoads) {
            console.log(`No specific match found, using first valid image: ${file.name}`);
            setImageUrl(publicUrlData.publicUrl);
            
            // Update the memory in the database
            if (memory.id) {
              await updateMemoryWithImageUrl(memory.id, publicUrlData.publicUrl);
            }
            
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error finding matching image:', error);
    }
  };
  
  // Update memory with image URL
  const updateMemoryWithImageUrl = async (id: string, url: string) => {
    try {
      const { error } = await supabase
        .from('memory_timeline')
        .update({ image_url: url })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating memory with image URL:', error);
      } else {
        console.log(`Updated memory "${memory.title}" with image URL in database`);
      }
    } catch (err) {
      console.error('Error in updateMemoryWithImageUrl:', err);
    }
  };
  
  // Helper to check if an image URL is valid and loads
  const checkImageUrl = async (url: string): Promise<boolean> => {
    if (!url) return false;
    
    return new Promise((resolve) => {
      const img = document.createElement('img');
      
      const timeout = setTimeout(() => {
        console.warn(`Image load timeout: ${url}`);
        resolve(false);
      }, 5000); // 5 second timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        console.log(`Image pre-check successful: ${url}`);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
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
  
  const handleRetryImage = async () => {
    setIsRetrying(true);
    setImageError(false);
    
    try {
      // Reset states
      setImageUrl(null);
      
      // Try to find a different image
      await findMatchingImageInStorage();
    } catch (error) {
      console.error('Error retrying image:', error);
      setImageError(true);
    } finally {
      setIsRetrying(false);
    }
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
        
        <div className="w-full h-40 bg-muted/50 rounded-lg mt-4 overflow-hidden relative">
          {!imageUrl && !isRetrying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Image className="w-10 h-10 text-muted-foreground/60" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryImage}
                className="text-xs mt-2"
              >
                Find image
              </Button>
            </div>
          )}
          
          {(isRetrying || (!isImageLoaded && imageUrl && !imageError)) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          )}
          
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={memory.title} 
              className={`w-full h-full object-cover rounded-lg transition-all duration-500 ${isImageLoaded ? 'opacity-100 hover:scale-105' : 'opacity-0'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
          
          {imageError && imageUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <p className="text-muted-foreground text-sm">Image not available</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetryImage}
                disabled={isRetrying}
                className="text-xs mt-2"
              >
                {isRetrying ? 'Searching...' : 'Try another image'}
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Heart size={18} className="text-primary animate-heart-beat" fill="currentColor" />
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;

