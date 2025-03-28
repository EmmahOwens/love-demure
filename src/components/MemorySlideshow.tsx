import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
  CarouselThumbnails
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Pause, 
  Play, 
  AlertTriangle, 
  ImageIcon, 
  RefreshCw,
  Heart,
  ChevronLeft, 
  ChevronRight,
  Info,
  Maximize,
  Minimize,
  Share2,
  Download,
  Bookmark
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSwipeable } from 'react-swipeable';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState<Record<string, boolean>>({});
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const ensureBucketExists = async () => {
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error("Error listing buckets:", bucketsError);
          return;
        }
        
        const bucketExists = buckets?.some(bucket => bucket.name === 'memories');
        
        if (!bucketExists) {
          console.log("Creating 'memories' bucket as it doesn't exist");
          const { error } = await supabase.storage.createBucket('memories', {
            public: true
          });
          
          if (error) {
            console.error("Error creating memories bucket:", error);
          } else {
            console.log("Successfully created 'memories' bucket");
          }
        }
      } catch (error) {
        console.error("Error checking/creating bucket:", error);
      }
    };
    
    ensureBucketExists();
  }, []);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: timelineData, error: timelineError } = await supabase
        .from('memory_timeline')
        .select('*')
        .order('raw_date', { ascending: false });
        
      if (timelineError) {
        throw new Error('Error fetching memory timeline: ' + timelineError.message);
      }
      
      console.log(`Found ${timelineData?.length || 0} records in memory_timeline`);
      
      const { data: detailsData, error: detailsError } = await supabase
        .from('memory_details')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (detailsError) {
        throw new Error('Error fetching memory details: ' + detailsError.message);
      }
      
      console.log(`Found ${detailsData?.length || 0} records in memory_details`);
      
      const memoryImagesPromises: Promise<MemoryImage | null>[] = [];
      
      if (timelineData && timelineData.length > 0) {
        timelineData.forEach(timeline => {
          if (timeline.image_url) {
            memoryImagesPromises.push(processTimelineMemory(timeline));
          } else {
            const matchingDetail = detailsData?.find(detail => {
              if (!timeline.raw_date || !detail.date_taken) return false;
              
              const timelineDate = new Date(timeline.raw_date).toISOString().split('T')[0];
              const detailDate = new Date(detail.date_taken).toISOString().split('T')[0];
              return timelineDate === detailDate;
            });
            
            if (matchingDetail) {
              memoryImagesPromises.push(processDetailMemory(matchingDetail, timeline));
            } else {
              memoryImagesPromises.push(processTimelineMemory(timeline));
            }
          }
        });
      }
      
      if (detailsData && detailsData.length > 0) {
        detailsData.forEach(detail => {
          const hasMatchingTimeline = timelineData?.some(timeline => {
            if (!timeline.raw_date || !detail.date_taken) return false;
            
            const timelineDate = new Date(timeline.raw_date).toISOString().split('T')[0];
            const detailDate = new Date(detail.date_taken).toISOString().split('T')[0];
            return timelineDate === detailDate;
          });
          
          if (!hasMatchingTimeline) {
            memoryImagesPromises.push(processDetailMemory(detail));
          }
        });
      }
      
      const memoryImages = (await Promise.all(memoryImagesPromises))
        .filter(Boolean) as MemoryImage[];
      
      if (memoryImages.length > 0) {
        const uniqueMemories = removeDuplicates(memoryImages, 'url');
        setMemories(uniqueMemories);
        console.log(`Processed ${uniqueMemories.length} unique memories for display`);
      } else {
        console.log("No memory images found to display");
      }
    } catch (err) {
      console.error('Error in memory fetch:', err);
      setError(err instanceof Error ? err.message : 'Unknown error fetching images');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const removeDuplicates = (arr: any[], key: string) => {
    return [...new Map(arr.map(item => [item[key], item])).values()];
  };

  const processTimelineMemory = async (timeline: any): Promise<MemoryImage | null> => {
    try {
      if (timeline.image_url) {
        const imageLoads = await checkImageLoads(timeline.image_url);
        
        if (!imageLoads) {
          console.warn(`Timeline image failed preload check: ${timeline.image_url}`);
          setImageErrors(prev => ({
            ...prev,
            [timeline.id]: true
          }));
        }
        
        return {
          id: timeline.id,
          url: timeline.image_url,
          fileName: '',
          displayName: timeline.title,
          description: timeline.description,
          dateTaken: timeline.raw_date,
          location: null
        };
      }
      
      return null;
    } catch (e) {
      console.error(`Error processing timeline memory ${timeline.id}:`, e);
      return null;
    }
  };

  const processDetailMemory = async (detail: any, timeline?: any): Promise<MemoryImage | null> => {
    try {
      const { data: publicUrlData } = supabase
        .storage
        .from('memories')
        .getPublicUrl(detail.file_name);
      
      console.log(`Generated URL for ${detail.file_name}: ${publicUrlData.publicUrl}`);
      
      const imageLoads = await checkImageLoads(publicUrlData.publicUrl);
      
      if (!imageLoads) {
        console.warn(`Detail image failed preload check: ${detail.file_name}`);
        setImageErrors(prev => ({
          ...prev,
          [detail.id]: true
        }));
      }
      
      return {
        id: detail.id,
        url: publicUrlData.publicUrl,
        fileName: detail.file_name,
        displayName: timeline?.title || detail.display_name,
        description: timeline?.description || detail.description,
        dateTaken: timeline?.raw_date || detail.date_taken,
        location: detail.location
      };
    } catch (e) {
      console.error(`Error processing detail memory ${detail.id}:`, e);
      return null;
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const checkImageLoads = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  useEffect(() => {
    if (!autoplayEnabled || memories.length <= 1 || isRefreshing) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === memories.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [memories.length, autoplayEnabled, isRefreshing]);

  useEffect(() => {
    if (!isFullscreen) return;
    
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      setControlsTimeout(timeout);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [isFullscreen, controlsTimeout]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            navigateSlide('prev');
            break;
          case 'ArrowRight':
            navigateSlide('next');
            break;
          case 'Escape':
            setIsFullscreen(false);
            break;
          case ' ':  // spacebar
            setAutoplayEnabled(prev => !prev);
            break;
          case 'i':
            setShowInfo(prev => !prev);
            break;
          default:
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const navigateSlide = useCallback((direction: 'prev' | 'next') => {
    if (memories.length <= 1) return;
    
    setCurrentIndex(prevIndex => {
      if (direction === 'prev') {
        return prevIndex === 0 ? memories.length - 1 : prevIndex - 1;
      } else {
        return prevIndex === memories.length - 1 ? 0 : prevIndex + 1;
      }
    });
  }, [memories.length]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigateSlide('next'),
    onSwipedRight: () => navigateSlide('prev'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handleImageError = (id: string) => {
    console.log(`Image with ID ${id} failed to load`);
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMemories();
    toast.success("Refreshing memory slideshow...");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowInfo(!isFullscreen);
    setShowControls(true);
  };

  const handleBookmark = (memoryId: string) => {
    setIsBookmarked(prev => ({
      ...prev,
      [memoryId]: !prev[memoryId]
    }));
    
    toast.success(
      isBookmarked[memoryId] 
        ? "Memory removed from favorites" 
        : "Memory added to favorites"
    );
  };

  const handleShare = () => {
    if (navigator.share && memories[currentIndex]) {
      navigator.share({
        title: memories[currentIndex].displayName,
        text: memories[currentIndex].description || 'Check out this memory!',
        url: window.location.href,
      }).catch(error => {
        console.error('Error sharing:', error);
        toast.error("Couldn't share this memory");
      });
    } else {
      toast.info("Sharing not supported on this device");
    }
  };

  const handleDownload = () => {
    if (memories[currentIndex] && !imageErrors[memories[currentIndex].id]) {
      const memory = memories[currentIndex];
      const link = document.createElement('a');
      link.href = memory.url;
      link.download = memory.fileName || `memory-${memory.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloading memory...");
    } else {
      toast.error("Cannot download this image");
    }
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="mt-4"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const thumbnailData = memories.map(memory => ({
    src: memory.url,
    alt: memory.displayName
  }));

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-center">Memory Slideshow</h2>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh memories</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle info display</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost" 
            size="sm"
            onClick={() => setAutoplayEnabled(!autoplayEnabled)}
            className="text-sm flex items-center gap-1"
          >
            {autoplayEnabled ? (
              <>
                <Pause className="h-3 w-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Play
              </>
            )}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="neu-element p-8 flex flex-col space-y-4 min-h-[300px]">
          <Skeleton className="h-[220px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <div className="flex justify-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-2 w-2 rounded-full" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="neu-element p-8 text-center text-destructive">
          <AlertTriangle className="mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <div 
          className={cn(
            "neu-element p-6 relative transition-all duration-300", 
            isFullscreen && "fixed inset-0 z-50 p-4 max-w-none neu-element-inset"
          )}
          {...swipeHandlers}
        >
          <Carousel 
            className="w-full"
            opts={{
              loop: true,
              align: "center",
            }}
            onSelect={(index) => {
              if (typeof index === 'number') {
                setCurrentIndex(index);
              }
            }}
          >
            <CarouselContent>
              {memories.map((memory, index) => (
                <CarouselItem 
                  key={memory.id} 
                  className="relative cursor-pointer"
                  onClick={toggleFullscreen}
                >
                  <div className="p-1">
                    <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-xl bg-muted">
                      {!imageErrors[memory.id] ? (
                        <img
                          src={memory.url}
                          alt={memory.displayName}
                          className={cn(
                            "object-cover w-full h-full transition-transform duration-1000 hover:scale-105 animate-fade-in",
                            isFullscreen && "object-contain"
                          )}
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
                    
                    {showInfo && (
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
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious 
              positionClass="left-2 bottom-1/2 transform translate-y-1/2"
              className="bg-black/20 text-white hover:bg-black/40 transition-all" 
            />
            <CarouselNext 
              positionClass="right-2 bottom-1/2 transform translate-y-1/2"
              className="bg-black/20 text-white hover:bg-black/40 transition-all" 
            />
            
            {!isFullscreen && (
              <CarouselDots 
                count={memories.length} 
                className="mt-4" 
              />
            )}
          </Carousel>
          
          {!isFullscreen && memories.length > 1 && (
            <div className="mt-4">
              <CarouselThumbnails 
                thumbnails={thumbnailData}
                className="mt-2"
                itemClassName="transition-all duration-300 hover:shadow-md"
              />
            </div>
          )}
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart size={14} className="text-primary animate-pulse" fill="currentColor" />
              {memories.length > 0 && `${currentIndex + 1} of ${memories.length}`}
            </div>
            
            {isFullscreen && (
              <>
                <div className={cn(
                  "fixed inset-0 pointer-events-none z-10",
                  !showControls && "opacity-0"
                )} />
                <div className={cn(
                  "fixed top-4 right-4 flex items-center gap-2 transition-opacity duration-300 z-20",
                  !showControls && "opacity-0"
                )}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowInfo(!showInfo)}
                    className="bg-black/20 text-white border-white/10 hover:bg-black/40 transition-all"
                  >
                    <Info size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleBookmark(memories[currentIndex].id)}
                    className={cn(
                      "bg-black/20 text-white border-white/10 hover:bg-black/40 transition-all",
                      isBookmarked[memories[currentIndex].id] && "text-primary bg-black/30"
                    )}
                  >
                    <Bookmark size={16} fill={isBookmarked[memories[currentIndex].id] ? "currentColor" : "none"} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="bg-black/20 text-white border-white/10 hover:bg-black/40 transition-all"
                  >
                    <Share2 size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownload}
                    className="bg-black/20 text-white border-white/10 hover:bg-black/40 transition-all"
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="bg-black/20 text-white border-white/10 hover:bg-black/40 transition-all"
                  >
                    <Minimize size={16} />
                  </Button>
                </div>
                
                <div className={cn(
                  "fixed left-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-300 z-20",
                  !showControls && "opacity-0"
                )}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-black/20 text-white border-white/10 hover:bg-black/40 transition-all h-10 w-10"
                    onClick={() => navigateSlide('prev')}
                  >
                    <ChevronLeft size={24} />
                  </Button>
                </div>
                
                <div className={cn(
                  "fixed right-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-300 z-20",
                  !showControls && "opacity-0"
                )}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-black/20 text-white border-white/10 hover:bg-black/40 transition-all h-10 w-10"
                    onClick={() => navigateSlide('next')}
                  >
                    <ChevronRight size={24} />
                  </Button>
                </div>
              </>
            )}
            
            {!isFullscreen && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1"
                >
                  <Maximize size={14} className="mr-1" />
                  Fullscreen
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default MemorySlideshow;
