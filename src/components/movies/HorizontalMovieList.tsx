import type { Movie, NewsItem } from "@/types";
import MovieCard, { NewsCard } from "./MovieCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import MovieFilterCard from "./MovieFilterCard";

interface HorizontalMovieListProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  movies?: (Movie & { rank?: number })[];
  newsItems?: NewsItem[];
  itemType: "movie" | "news" | "movie-stats";
}

export default function HorizontalMovieList({
  title,
  movies,
  newsItems,
  itemType,
  id,
}: HorizontalMovieListProps) {
  const items =
    itemType === "movie" || itemType === "movie-stats" ? movies : newsItems;

  if (!items || items.length === 0) {
    return null;
  }

  const cardWidth =
    itemType === "movie-stats" ? "w-64 md:w-72" : "w-48 md:w-56";

  return (
    <section id={id}>
      <h2 className="text-3xl font-headline font-semibold mb-6 text-foreground">
        {title}
      </h2>
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex space-x-4">
          {items.map((item) => (
            <div
              key={item._id || item.id}
              className={`${cardWidth} flex-shrink-0`}
            >
              {itemType === "movie" && (
                <MovieCard
                  movie={item as Movie}
                  rank={(item as Movie & { rank?: number }).rank}
                />
              )}
              {itemType === "news" && <NewsCard newsItem={item as NewsItem} />}
              {itemType === "movie-stats" && (
                <MovieFilterCard
                  movie={item as Movie}
                  rank={(item as Movie & { rank?: number }).rank}
                />
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
