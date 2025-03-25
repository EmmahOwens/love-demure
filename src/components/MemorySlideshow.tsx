
import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface MemoryImage {
  id: string;
  url: string;
  fileName: string;
  displayName: string;
  description: string | null;
  dateTaken: string | null;
  location: string | null;
}

const MemorySlideshow = () => {
  const [memories, setMemories] = useState<MemoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);
        
        // Fetch memory details with metadata
        const { data: memoryDetails, error: detailsError } = await supabase
          .from('memory_details')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (detailsError) {
          throw new Error('Error fetching memory details: ' + detailsError.message);
        }
        
        if (!memoryDetails || memoryDetails.length === 0) {
          // If no memory details exist, try to fetch directly from storage
          const { data: storageFiles, error: storageError } = await supabase
            .storage
            .from('memories')
            .list();
            
          if (storageError) {
            throw new Error('Error fetching images: ' + storageError.message);
          }
          
          if (storageFiles && storageFiles.length > 0) {
            // Filter only image files
            const imageFiles = storageFiles.filter(file => 
              file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
            );
            
            // Create memory objects from storage files
            const memoryImages: MemoryImage[] = imageFiles.map(file => ({
              id: file.id,
              url: `${supabase.storage.from('memories').getPublicUrl(file.name).data.publicUrl}`,
              fileName: file.name,
              displayName: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
              description: null,
              dateTaken: null,
              location: null
            }));
            
            setMemories(memoryImages);
          }
        } else {
          // Create memory objects from detailed records
          const memoryImages: MemoryImage[] = await Promise.all(
            memoryDetails.map(async detail => {
              const { data: publicUrlData } = supabase
                .storage
                .from('memories')
                .getPublicUrl(detail.file_name);
                
              return {
                id: detail.id,
                url: publicUrlData.publicUrl,
                fileName: detail.file_name,
                displayName: detail.display_name,
                description: detail.description,
                dateTaken: detail.date_taken,
                location: detail.location
              };
            })
          );
          
          setMemories(memoryImages);
        }
      } catch (err) {
        console.error('Error in memory fetch:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching images');
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, []);

  // Set up autoplay for the slideshow
  useEffect(() => {
    if (!autoplayEnabled || memories.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === memories.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [memories.length, autoplayEnabled]);

  // If no images are uploaded yet, show a placeholder
  if (memories.length === 0 && !loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 px-4">
        <h2 className="text-3xl font-semibold text-center mb-6">Memory Slideshow</h2>
        <div className="neu-element p-8 text-center">
          <p className="mb-4">No memories uploaded yet.</p>
          <p className="text-muted-foreground">
            Upload your special moments using the form below to see them displayed here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <h2 className="text-3xl font-semibold text-center mb-6">Memory Slideshow</h2>
      
      {loading ? (
        <div className="neu-element p-8 flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse-soft">Loading your special memories...</div>
        </div>
      ) : error ? (
        <div className="neu-element p-8 text-center text-destructive">
          {error}
        </div>
      ) : (
        <div className="neu-element p-6">
          <Carousel 
            className="w-full"
            onSelect={(index) => {
              // Fix: Properly handle the index passed from the Carousel component
              if (typeof index === 'number') {
                setCurrentIndex(index);
              }
            }}
          >
            <CarouselContent>
              {memories.map((memory, index) => (
                <CarouselItem key={memory.id} className="relative">
                  <div className="p-1">
                    <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl">
                      <img
                        src={memory.url}
                        alt={memory.displayName}
                        className="object-cover w-full h-full transition-all duration-700 animate-fade-in"
                      />
                    </AspectRatio>
                    
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white rounded-b-xl">
                      <h3 className="font-semibold text-lg">{memory.displayName}</h3>
                      
                      {memory.description && (
                        <p className="text-sm mt-1 text-white/90 line-clamp-2">
                          {memory.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {memory.dateTaken && (
                          <Badge variant="outline" className="bg-black/30 border-white/20 text-white flex items-center gap-1">
                            <Calendar size={12} />
                            {format(new Date(memory.dateTaken), 'MMM d, yyyy')}
                          </Badge>
                        )}
                        
                        {memory.location && (
                          <Badge variant="outline" className="bg-black/30 border-white/20 text-white flex items-center gap-1">
                            <MapPin size={12} />
                            {memory.location}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {memories.length > 0 && `${currentIndex + 1} of ${memories.length}`}
            </div>
            
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setAutoplayEnabled(!autoplayEnabled)}
              className="text-sm"
            >
              {autoplayEnabled ? "Pause Slideshow" : "Auto Play"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemorySlideshow;

function Button({ children, variant, size, onClick, className }: { 
  children: React.ReactNode; 
  variant?: string;
  size?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button 
      onClick={onClick} 
      className={`px-3 py-1 rounded hover:bg-gray-200/10 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
