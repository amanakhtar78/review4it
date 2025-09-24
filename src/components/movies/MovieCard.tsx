

import Link from 'next/link';
import Image from 'next/image';
import type { Movie, NewsItem } from '@/types'; // Ensure Movie type is up-to-date
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Link as LinkIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '../ui/button';
import MovieActionBar from './MovieActionBar';

interface MovieCardProps {
  movie: Movie;
  rank?: number;
}

export default function MovieCard({ movie, rank }: MovieCardProps) {
  const imdbRatingValue = movie.ratings?.imdb ? String(movie.ratings.imdb) : null;

  // Ensure movie.id or movie._id is used.
  const movieId = movie.id || movie._id;
  
  if (!movieId) {
      return null;
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out group hover:shadow-xl hover:border-primary/50">
       <CardHeader className="p-0 relative h-[250px]">
        <Link href={`/movies/${movieId}`} className="block group/poster">
            {movie.image_1 || movie.bannerVertical ? (
              <Image
                src={movie.image_1 || movie.bannerVertical!}
                alt={movie.title}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover/poster:scale-105"
                data-ai-hint={movie.dataAiHint || "movie poster"}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
                No Poster
              </div>
            )}
            {rank && (
              <Badge 
                variant="default" 
                className="absolute top-2 right-2 z-10 bg-primary/80 text-primary-foreground text-xs px-1.5 py-0.5"
              >
                #{rank}
              </Badge>
            )}
        </Link>
        </CardHeader>
      <CardContent className="p-3 flex-grow">
        <Link href={`/movies/${movieId}`} className="block group/title">
          <CardTitle className="font-headline text-md mb-1 leading-tight group-hover/title:text-primary transition-colors">
            {movie.title}
          </CardTitle>
        </Link>
        {movie.movieReleaseDate && (
          <p className="text-xs text-muted-foreground mb-2">
            {format(parseISO(movie.movieReleaseDate), 'MMM d, yyyy')}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <MovieActionBar movie={movie} />
      </CardFooter>
    </Card>
  );
}

export function NewsCard({ newsItem }: { newsItem: NewsItem }) {
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out group hover:shadow-xl hover:border-primary/50">
      <CardContent className="p-4 flex-grow flex flex-col">
        <CardTitle className="font-headline text-md mb-2 leading-tight group-hover:text-primary transition-colors">
          {newsItem.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground line-clamp-3 flex-grow">{newsItem.snippet}</p>
      </CardContent>
       <CardFooter className="p-4 pt-0">
         <Button variant="link" asChild className="p-0 h-auto text-xs">
            <Link href={newsItem.link} target="_blank" rel="noopener noreferrer">
                Read More <LinkIcon className="ml-1 h-3 w-3" />
            </Link>
         </Button>
      </CardFooter>
    </Card>
  );
}
