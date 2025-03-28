
import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  selectedIndex: number
  scrollTo: (index: number) => void
  slideCount: number
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [slideCount, setSlideCount] = React.useState(0)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setSelectedIndex(api.selectedScrollSnap())
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
      setSlideCount(api.slideNodes().length)
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const scrollTo = React.useCallback((index: number) => {
      api?.scrollTo(index)
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          scrollTo,
          slideCount,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { positionClass?: string }
>(({ className, variant = "outline", size = "icon", positionClass, ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        positionClass || (orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90"),
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { positionClass?: string }
>(({ className, variant = "outline", size = "icon", positionClass, ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        positionClass || (orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90"),
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

const CarouselDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { count: number }
>(({ className, count, ...props }, ref) => {
  const { api, selectedIndex, scrollTo } = useCarousel()
  
  return (
    <div 
      ref={ref}
      className={cn("flex gap-1 justify-center mt-2", className)}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Button
          key={index}
          variant="ghost"
          size="icon"
          className={cn(
            "h-2 w-2 rounded-full p-0 backdrop-blur-sm",
            selectedIndex === index 
              ? "bg-primary" 
              : "bg-primary/30 hover:bg-primary/50"
          )}
          onClick={() => scrollTo(index)}
        >
          <span className="sr-only">
            Go to slide {index + 1}
          </span>
        </Button>
      ))}
    </div>
  )
})
CarouselDots.displayName = "CarouselDots"

const CarouselThumbnails = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    thumbnails: Array<{ src: string; alt: string; }>;
    itemClassName?: string;
  }
>(({ className, thumbnails, itemClassName, ...props }, ref) => {
  const { selectedIndex, scrollTo } = useCarousel()
  
  return (
    <div 
      ref={ref}
      className={cn("flex gap-2 overflow-x-auto py-2 px-1 scrollbar-none snap-x snap-mandatory", className)}
      {...props}
    >
      {thumbnails.map((thumbnail, index) => (
        <Button
          key={index}
          variant="ghost"
          className={cn(
            "p-0 h-16 min-w-16 rounded overflow-hidden border-2 snap-start",
            selectedIndex === index 
              ? "border-primary" 
              : "border-transparent opacity-70 hover:opacity-100",
            itemClassName
          )}
          onClick={() => scrollTo(index)}
        >
          <img 
            src={thumbnail.src} 
            alt={thumbnail.alt}
            className="w-full h-full object-cover" 
          />
        </Button>
      ))}
    </div>
  )
})
CarouselThumbnails.displayName = "CarouselThumbnails"

// New component for pagination
const CarouselPagination = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { selectedIndex, slideCount, scrollTo } = useCarousel()
  
  // Calculate pagination range
  const displayPages = 5; // Number of page buttons to show
  const halfDisplay = Math.floor(displayPages / 2);
  let startPage = Math.max(0, selectedIndex - halfDisplay);
  let endPage = Math.min(slideCount - 1, startPage + displayPages - 1);
  
  // Adjust if we're near the end
  if (endPage - startPage < displayPages - 1) {
    startPage = Math.max(0, endPage - displayPages + 1);
  }
  
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  
  return (
    <div 
      ref={ref}
      className={cn("flex items-center justify-center gap-1 mt-4", className)}
      {...props}
    >
      {slideCount > displayPages && selectedIndex > 0 && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => scrollTo(0)}
        >
          <span>&laquo;</span>
          <span className="sr-only">First slide</span>
        </Button>
      )}
      
      {pages.map(page => (
        <Button
          key={page}
          variant={page === selectedIndex ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 w-8 rounded-full p-0",
            page === selectedIndex && "bg-primary text-primary-foreground"
          )}
          onClick={() => scrollTo(page)}
        >
          {page + 1}
          <span className="sr-only">Page {page + 1}</span>
        </Button>
      ))}
      
      {slideCount > displayPages && selectedIndex < slideCount - 1 && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => scrollTo(slideCount - 1)}
        >
          <span>&raquo;</span>
          <span className="sr-only">Last slide</span>
        </Button>
      )}
    </div>
  )
})
CarouselPagination.displayName = "CarouselPagination"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselThumbnails,
  CarouselPagination
}
