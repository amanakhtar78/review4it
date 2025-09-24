"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Film, Loader2, Tv } from "lucide-react";
import type { Movie } from "@/types";
import MovieCard from "@/components/movies/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "@/data/languages";

type UpcomingType = "Movie" | "Web Series";

export default function UpcomingPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState<UpcomingType>("Movie");
  const [content, setContent] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [selectedLanguage, setSelectedLanguage] = React.useState("All");

  const fetchContent = React.useCallback(
    async (
      type: UpcomingType,
      language: string,
      pageNum: number,
      initialLoad = false
    ) => {
      if (initialLoad) {
        setIsLoading(true);
        setContent([]);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await fetch(
          `/api/movieseries/upcoming?type=${type}&languages=${language}&limit=10&page=${pageNum}`
        );
        const data = await response.json();
        if (data.success) {
          setContent((prev) =>
            pageNum === 1 ? data.data : [...prev, ...data.data]
          );
          if (data.data.length < 10 || data.pagination.totalPages === pageNum) {
            setHasMore(false);
          }
        } else {
          throw new Error(data.error || "Failed to fetch content");
        }
      } catch (error: any) {
        toast({
          title: "Error fetching content",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [toast]
  );

  React.useEffect(() => {
    fetchContent(activeTab, selectedLanguage, 1, true);
    setPage(1);
  }, [activeTab, selectedLanguage, fetchContent]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchContent(activeTab, selectedLanguage, nextPage);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <h1 className="text-3xl sm:text-4xl font-headline font-bold">
          Upcoming Releases
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as UpcomingType)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Movie">
                <Film className="mr-2 h-4 w-4" /> Movies
              </TabsTrigger>
              <TabsTrigger value="Web Series">
                <Tv className="mr-2 h-4 w-4" /> Web Series
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            value={selectedLanguage}
            onValueChange={(val) => setSelectedLanguage(val)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.name}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[250px] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : content.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {content.map((item) => (
              <MovieCard
                key={item._id}
                movie={
                  { ...item, movie_title: item.title, id: item._id } as Movie
                }
              />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <h2 className="text-xl font-semibold">
            No upcoming {activeTab.toLowerCase()} found.
          </h2>
          <p>Please check back later or adjust your filters.</p>
        </div>
      )}
    </div>
  );
}
