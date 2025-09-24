"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Film as FilmIcon, Loader2 } from "lucide-react";
import type { Movie } from "@/types";
import { movieSeriesApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [results, setResults] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [defaultMovies, setDefaultMovies] = React.useState<Movie[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const previousPathname = React.useRef(pathname);
  React.useEffect(() => {
    if (isOpen && previousPathname.current !== pathname) {
      setIsOpen(false);
    }
    previousPathname.current = pathname;
  }, [pathname, isOpen]);

  const fetchDefaultMovies = React.useCallback(async () => {
    if (defaultMovies.length > 0) {
      setResults(defaultMovies);
      return;
    }
    setIsLoading(true);
    try {
      // Align with single source: use limit=10 and reuse subset if needed
      const response = await fetch("/api/movieseries/in-theaters?limit=10");
      const data = await response.json();
      if (data.success) {
        const list: Movie[] = data.data.slice(0, 10);
        setDefaultMovies(list);
        setResults(list);
      } else {
        throw new Error("Failed to fetch default movies");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch current movies.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, defaultMovies]);

  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(defaultMovies);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const fetchResults = async () => {
      try {
        const data = await movieSeriesApi.search(searchTerm);
        setResults(data);
      } catch (error) {
        toast({
          title: "Search Failed",
          description: "Could not fetch movie results.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, toast, defaultMovies]);

  const handleMovieSelect = (movieId: string) => {
    router.push(`/movies/${movieId}`);
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchDefaultMovies();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm("");
      setResults([]);
    }
  }, [isOpen, fetchDefaultMovies]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open search (Ctrl+K or Cmd+K)"
          title="Search (Ctrl+K or Cmd+K)"
          className="h-9 w-9 sm:h-10 sm:w-10"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 top-[25%] sm:top-[30%]">
        <DialogHeader className="p-3 border-b sm:p-4">
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 text-sm sm:text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-200px)] sm:max-h-[300px]">
          {isLoading ? (
            <div className="p-4 py-6 text-sm text-muted-foreground text-center flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : results.length > 0 ? (
            <ul className="space-y-0 p-2 sm:p-3">
              {results.map((movie) => (
                <li key={movie._id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-2.5 px-3 text-left text-sm rounded-md"
                    onClick={() => handleMovieSelect(movie._id!)}
                  >
                    <FilmIcon className="h-4 w-4 mr-2.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{movie.title}</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : searchTerm.trim() && !isLoading ? (
            <p className="p-4 py-6 text-sm text-muted-foreground text-center">
              No results found.
            </p>
          ) : (
            !isLoading && (
              <p className="p-4 py-6 text-sm text-muted-foreground text-center">
                Start typing to search for movies.
              </p>
            )
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
