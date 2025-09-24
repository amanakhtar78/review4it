"use client";

import * as React from "react";
import CustomCarousel from "@/components/movies/CustomCarousel";
import HorizontalMovieList from "@/components/movies/HorizontalMovieList";
import BoxOfficeTable from "@/components/movies/BoxOfficeTable";
import QuickNav from "@/components/movies/QuickNav";
import type { Movie, NewsItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UpcomingSection from "@/components/movies/UpcomingSection";
import InTheatersSection from "@/components/movies/InTheatersSection";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const movieZones = ["All", "Hollywood", "Bollywood", "Tollywood"];

export default function HomePage() {
  const [zone, setZone] = React.useState("All");
  const [latestNews, setLatestNews] = React.useState<NewsItem[]>([]);
  const [latestReleases, setLatestReleases] = React.useState<Movie[]>([]);
  const { toast } = useToast();

  const [yearlySummary, setYearlySummary] = React.useState<{
    winners: Movie[];
    losers: Movie[];
  }>({ winners: [], losers: [] });
  const [isSummaryLoading, setIsSummaryLoading] = React.useState(true);

  const availableYears = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  }, []);

  const [year, setYear] = React.useState(String(new Date().getFullYear()));

  const fetchNewsAndReleases = React.useCallback(async () => {
    try {
      // Single call: in-theaters with limit=10
      const response = await fetch(`/api/movieseries/in-theaters?limit=10`);
      const data = await response.json();
      if (data.success) {
        const list: Movie[] = data.data.slice(0, 10);
        setLatestReleases(list);
        // Derive news from the same list (avoid extra calls)
        const newsItems = list
          .slice(0, 5)
          .map((movie: Movie) => {
            const news = movie.RelatedNews?.[0];
            if (!news) return null;
            return {
              id: `${movie._id}-news`,
              title: news.title,
              snippet: news.description || "No description available.",
              imageUrl: news.image,
              link: news.sourceLink || "#",
            };
          })
          .filter(Boolean);
        setLatestNews(newsItems as NewsItem[]);
      } else {
        throw new Error(data.error || "Failed to fetch news");
      }
    } catch (error: any) {
      toast({
        title: "Could not load latest news",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  React.useEffect(() => {
    fetchNewsAndReleases();
  }, [fetchNewsAndReleases]);

  React.useEffect(() => {
    const fetchYearlySummary = async () => {
      if (!year || year === "All") return;
      setIsSummaryLoading(true);
      try {
        const response = await fetch(
          `/api/movieseries/yearly-summary?year=${year}&zone=${zone}`
        );
        const data = await response.json();
        if (data.success) {
          setYearlySummary(data.data);
        } else {
          throw new Error(data.error || "Failed to fetch yearly summary");
        }
      } catch (error: any) {
        toast({
          title: `Could not load summary for ${year}`,
          description: error.message,
          variant: "destructive",
        });
        setYearlySummary({ winners: [], losers: [] });
      } finally {
        setIsSummaryLoading(false);
      }
    };
    fetchYearlySummary();
  }, [year, zone, toast]);

  const carouselItems = latestReleases.slice(0, 5).map((movie) => ({
    src:
      movie.bannerHorizontal ||
      movie.image_2 ||
      movie.image_1 ||
      "https://placehold.co/1200x500.png",
    alt: movie.title,
    dataAiHint: movie.dataAiHint || "movie scene",
    title: movie.title,
    earnings: movie.earnings,
    budget: movie.budget,
    id: movie._id,
  }));

  return (
    <div className="space-y-12">
      <section id="top-carousel" className="mb-12 -mx-4 md:mx-0">
        {carouselItems.length > 0 && (
          <CustomCarousel
            items={carouselItems}
            autoPlayInterval={5000}
            imageClassName="object-cover"
          />
        )}
      </section>

      <QuickNav />

      <InTheatersSection />

      <UpcomingSection />

      <section id="yearly-summary" className="py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-3xl font-headline font-semibold text-foreground">
            Yearly Summary
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {movieZones.map((z) => (
              <Button
                key={z}
                variant={zone === z ? "default" : "outline"}
                size="sm"
                onClick={() => setZone(z)}
              >
                {z}
              </Button>
            ))}
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px] h-9 text-sm">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-10">
          {isSummaryLoading ? (
            <>
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="flex space-x-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-72 w-64" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <div className="flex space-x-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-72 w-64" />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <HorizontalMovieList
                title="Yearly Top Winners"
                movies={yearlySummary.winners}
                itemType="movie-stats"
              />
              <HorizontalMovieList
                title="Yearly Top Losers"
                movies={yearlySummary.losers}
                itemType="movie-stats"
              />
            </>
          )}
        </div>
      </section>

      <HorizontalMovieList
        id="movie-news"
        title="Movie News"
        newsItems={latestNews}
        itemType="news"
      />

      <section id="box-office-report">
        <BoxOfficeTable />
      </section>
    </div>
  );
}
