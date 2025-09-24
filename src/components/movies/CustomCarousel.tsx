
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useCurrency } from '@/context/CurrencyContext';

interface CarouselItem {
    id?: string;
    src: string;
    alt: string;
    dataAiHint?: string;
    title?: string;
    earnings?: number;
    budget?: number;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number; // in milliseconds
  className?: string;
  imageClassName?: string;
  showDots?: boolean;
}

export default function CustomCarousel({ 
  items, 
  autoPlayInterval, 
  className, 
  imageClassName,
  showDots = true 
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { formatCurrency } = useCurrency();

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  }, [items.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  }, [items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (autoPlayInterval) {
      const timer = setInterval(goToNext, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [goToNext, autoPlayInterval]);

  if (!items || items.length === 0) {
    return <div className={cn("relative w-full aspect-video bg-muted flex items-center justify-center custom-card-shadow", className)}>No images to display.</div>;
  }

  return (
    <div className={cn("relative w-full overflow-hidden custom-card-shadow", className)}>
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0 relative">
            <Link href={item.id ? `/movies/${item.id}` : '#'}>
              <div className="relative w-full">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={1200}
                  height={500}
                  className={cn("transition-opacity duration-500 w-full h-auto", imageClassName)}
                  priority={index === 0}
                  data-ai-hint={item.dataAiHint || "carousel image"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                {item.title && (
                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-white p-4 max-w-md">
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-headline font-bold drop-shadow-lg">{item.title}</h2>
                         {item.earnings !== undefined && item.budget !== undefined && item.earnings > 0 && (
                             <Badge variant={item.earnings > item.budget ? 'default' : 'destructive'} className="mt-2 text-xs md:text-sm">
                                {item.earnings > item.budget ? <TrendingUp className="h-4 w-4 mr-1"/> : <TrendingDown className="h-4 w-4 mr-1"/>}
                                Box Office: {formatCurrency(item.earnings)}
                             </Badge>
                         )}
                    </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 z-10 filter drop-shadow-md"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 z-10 filter drop-shadow-md"
            onClick={goToNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
      
      {showDots && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                currentIndex === index ? "bg-primary" : "bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
