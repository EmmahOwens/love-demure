
import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';

interface MemoryImage {
  id: string;
  url: string;
  alt: string;
}

const MemorySlideshow = () => {
  const [images, setImages] = useState<MemoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        // Fetch images from Supabase storage
        const { data, error: storageError } = await supabase
          .storage
          .from('memories')
          .list();

        if (storageError) {
          throw new Error('Error fetching images: ' + storageError.message);
        }

        if (data) {
          // Filter only image files
          const imageFiles = data.filter(file => 
            file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
          );

          // Create public URLs for each image
          const memoryImages: MemoryImage[] = imageFiles.map(file => ({
            id: file.id,
            url: `${supabase.storage.from('memories').getPublicUrl(file.name).data.publicUrl}`,
            alt: file.name.replace(/\.[^/.]+$/, "") // Remove file extension for alt text
          }));

          setImages(memoryImages);
        }
      } catch (err) {
        console.error('Error in image fetch:', err);
        setError(err instanceof Error ? err.message : 'Unknown error fetching images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // If no images are uploaded yet, show a placeholder or upload message
  if (images.length === 0 && !loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 px-4">
        <h2 className="text-3xl font-semibold text-center mb-6">Memory Slideshow</h2>
        <div className="neu-element p-8 text-center">
          <p className="mb-4">No memories uploaded yet.</p>
          <p className="text-muted-foreground">
            Upload your special moments to see them displayed here.
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
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image) => (
                <CarouselItem key={image.id}>
                  <div className="p-1">
                    <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="object-cover w-full h-full transition-all duration-700 animate-fade-in"
                        style={{ backdropFilter: 'blur(8px)' }}
                      />
                    </AspectRatio>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default MemorySlideshow;
