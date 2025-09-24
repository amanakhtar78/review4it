"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Film } from "lucide-react";
import type { Movie } from "@/types";
import MovieCard from "./MovieCard";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";

export default function InTheatersSection({ movies }: { movies?: Movie[] }) {
  const [inTheaters, setInTheaters] = React.useState<Movie[]>(movies || []);
  const [isLoading, setIsLoading] = React.useState(!movies);
  const { toast } = useToast();

  // If parent provides movies, use them and skip fetching
  React.useEffect(() => {
    if (movies) {
      setInTheaters(movies);
      setIsLoading(false);
    }
  }, [movies]);

  const fetchInTheaters = React.useCallback(async () => {
    if (movies) return; // already provided by parent
    setIsLoading(true);
    try {
      // Single source of truth: always request 10
      const response = await fetch(`/api/movieseries/in-theaters?limit=10`);
      const data = await response.json();
      if (data.success) {
        setInTheaters(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch "In Theaters" content');
      }
    } catch (error: any) {
      toast({
        title: "Error fetching content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, movies]);

  React.useEffect(() => {
    if (!movies) fetchInTheaters();
  }, [fetchInTheaters, movies]);

  return (
    <section id="in-theaters">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-headline font-semibold text-foreground flex items-center">
          <Film className="mr-3 h-7 w-7 text-primary" />
          In Theaters
        </h2>
        <Button variant="outline" asChild>
          <Link href="/in-theaters">
            View More <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
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
      ) : inTheaters.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex space-x-4">
            {inTheaters.map((item) => (
              <div key={item._id} className="w-48 md:w-56 flex-shrink-0">
                <MovieCard
                  movie={
                    { ...item, movie_title: item.title, id: item._id } as Movie
                  }
                />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No movies currently in theaters found.
        </div>
      )}
    </section>
  );
}
