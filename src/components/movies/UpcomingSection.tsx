
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Film, Tv } from 'lucide-react';
import type { Movie } from '@/types';
import MovieCard from './MovieCard';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type UpcomingType = 'Movie' | 'Web Series';

export default function UpcomingSection() {
  const [upcomingContent, setUpcomingContent] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<UpcomingType>('Movie');
  const { toast } = useToast();

  const fetchUpcoming = React.useCallback(async (type: UpcomingType) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/movieseries/upcoming?type=${type}&limit=5`);
      const data = await response.json();
      if (data.success) {
        setUpcomingContent(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch upcoming content');
      }
    } catch (error: any) {
      toast({
        title: "Error fetching upcoming content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchUpcoming(activeTab);
  }, [activeTab, fetchUpcoming]);

  return (
    <section id="upcoming-movies">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-3xl font-headline font-semibold text-foreground">Upcoming</h2>
            <div className="flex items-center gap-2">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UpcomingType)}>
                    <TabsList>
                        <TabsTrigger value="Movie"><Film className="mr-2 h-4 w-4" /> Movies</TabsTrigger>
                        <TabsTrigger value="Web Series"><Tv className="mr-2 h-4 w-4" />Web Series</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="outline" asChild>
                    <Link href="/upcoming">
                        View More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>

        {isLoading ? (
            <div className="flex space-x-4 pb-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-48 md:w-56 flex-shrink-0 space-y-2">
                        <Skeleton className="h-[250px] w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        ) : upcomingContent.length > 0 ? (
            <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex space-x-4">
                {upcomingContent.map((item) => (
                    <div key={item._id} className="w-48 md:w-56 flex-shrink-0">
                        <MovieCard movie={{...item, movie_title: item.title, id: item._id} as Movie} />
                    </div>
                ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        ) : (
            <div className="text-center text-muted-foreground py-8">
                No upcoming {activeTab.toLowerCase()} found.
            </div>
        )}
    </section>
  );
}
