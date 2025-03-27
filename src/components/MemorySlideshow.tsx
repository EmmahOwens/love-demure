
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
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Pause, Play, AlertTriangle, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setLoading(true);
        
        // Check if the 'memories' bucket exists
        const { data: buckets } = await supabase
          .storage
          .listBuckets();
          
        const bucketExists = buckets?.some(bucket => bucket.name === 'memories');
        
        if (!bucketExists) {
          console.log("'memories' bucket doesn't exist yet. Creating it...");
          // We'll handle this in the UI flow now - the bucket will be created during first upload
          toast.info("The memories bucket will be created when you upload your first memory");
        }
        
        // Fetch memory details from the table
        const { data: memoryDetails, error: detailsError } = await supabase
          .from('memory_details')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (detailsError) {
          throw new Error('Error fetching memory details: ' + detailsError.message);
        }
        
        console.log(`Found ${memoryDetails?.length || 0} memory details in database`);
        
        if (memoryDetails && memoryDetails.length > 0) {
          // Process the memory details into memory images with URLs
          const memoryImagesPromises = memoryDetails.map(async detail => {
            try {
              // Generate the public URL for the file
              const { data: publicUrlData } = supabase
                .storage
                .from('memories')
                .getPublicUrl(detail.file_name);
                
              console.log(`Generated URL for ${detail.file_name}: ${publicUrlData.publicUrl}`);
              
              // Check if the image loads correctly (preload)
              const imageLoads = await checkImageLoads(publicUrlData.publicUrl);
              
              if (!imageLoads) {
                console.warn(`Image failed preload check: ${detail.file_name}`);
                // We'll still return the memory, but track the error state
                setImageErrors(prev => ({
                  ...prev,
                  [detail.id]: true
                }));
              }
                
              return {
                id: detail.id,
                url: publicUrlData.publicUrl,
                fileName: detail.file_name,
                displayName: detail.display_name,
                description: detail.description,
                dateTaken: detail.date_taken,
                location: detail.location
              };
            } catch (e) {
              console.error(`Error generating URL for ${detail.file_name}:`, e);
              return null;
            }
          });
          
          // Resolve all promises and filter out null results
          const memoryImages = (await Promise.all(memoryImagesPromises)).filter(Boolean) as MemoryImage[];
          setMemories(memoryImages);
          
          if (memoryImages.length === 0 && memoryDetails.length > 0) {
            // We have details but no images loaded
            setError("Could not load any images. The files might be missing from storage.");
          }
        } else {
          // No memory details found
          console.log("No memory details found in database");
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

  // Helper function to check if an image loads
  const checkImageLoads = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  useEffect(() => {
    if (!autoplayEnabled || memories.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === memories.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [memories.length, autoplayEnabled]);

  const handleImageError = (id: string) => {
    console.log(`Image with ID ${id} failed to load`);
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  if (memories.length === 0 && !loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 px-4">
        <h2 className="text-3xl font-semibold text-center mb-6">Memory Slideshow</h2>
        <div className="neu-element p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
            <p className="mb-4">No memories uploaded yet.</p>
            <p className="text-muted-foreground">
              Upload your special moments using the form below to see them displayed here.
            </p>
          </div>
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
          <AlertTriangle className="mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div className="neu-element p-6">
          <Carousel 
            className="w-full"
            onSelect={(index) => {
              if (typeof index === 'number') {
                setCurrentIndex(index);
              }
            }}
          >
            <CarouselContent>
              {memories.map((memory, index) => (
                <CarouselItem key={memory.id} className="relative">
                  <div className="p-1">
                    <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl bg-muted">
                      {!imageErrors[memory.id] ? (
                        <img
                          src={memory.url}
                          alt={memory.displayName}
                          className="object-cover w-full h-full transition-transform duration-1000 hover:scale-105 animate-fade-in"
                          style={{ 
                            animationDelay: `${index * 0.2}s`,
                            animationDuration: '0.8s'
                          }}
                          onError={() => {
                            console.error("Image failed to load:", memory.url);
                            handleImageError(memory.id);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <AlertTriangle className="mx-auto mb-2 text-muted-foreground" size={32} />
                            <p className="text-muted-foreground">Image not available</p>
                          </div>
                        </div>
                      )}
                    </AspectRatio>
                    
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white rounded-b-xl transform transition-transform duration-500 animate-fade-in"
                      style={{ animationDelay: `${index * 0.2 + 0.3}s` }}>
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
            <CarouselPrevious className="left-2 bg-black/20 text-white hover:bg-black/40 transition-all" />
            <CarouselNext className="right-2 bg-black/20 text-white hover:bg-black/40 transition-all" />
          </Carousel>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {memories.length > 0 && `${currentIndex + 1} of ${memories.length}`}
            </div>
            
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setAutoplayEnabled(!autoplayEnabled)}
              className="text-sm flex items-center gap-1"
            >
              {autoplayEnabled ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause Slideshow
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Auto Play
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemorySlideshow;
