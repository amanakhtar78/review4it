"use client";

import * as React from "react";
import type { Movie } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { useCurrency } from "@/context/CurrencyContext";

type SuccessLevel = "Blockbuster" | "Hit" | "Average" | "Flop" | "Disaster";

const getVerdict = (movie: Movie): SuccessLevel => {
  if (!movie.budget || !movie.earnings) return "Average";
  const ratio = movie.earnings / movie.budget;
  if (ratio >= 3) return "Blockbuster";
  if (ratio >= 2) return "Hit";
  if (ratio >= 1) return "Average";
  if (ratio >= 0.5) return "Flop";
  return "Disaster";
};

export default function BoxOfficeTable() {
  const [allMovies, setAllMovies] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<
    "all" | "hollywood" | "bollywood" | "tollywood"
  >("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [year, setYear] = React.useState("All");
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const availableYears = React.useMemo(() => {
    const years = new Set(
      allMovies.map((m) =>
        new Date(m.movieReleaseDate || "1970-01-01").getFullYear()
      )
    );
    return ["All", ...Array.from(years).sort((a, b) => b - a)];
  }, [allMovies]);

  React.useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        // Use the same single call policy: limit=10
        const response = await fetch("/api/movieseries/in-theaters?limit=10");
        const data = await response.json();
        if (data.success) {
          setAllMovies(data.data);
          const mostRecentYear = new Date(
            Math.max(
              ...data.data.map((m: Movie) =>
                new Date(m.movieReleaseDate || "1970-01-01").getTime()
              )
            )
          ).getFullYear();
          if (mostRecentYear && !isNaN(mostRecentYear)) {
            setYear(String(mostRecentYear));
          } else {
            setYear("All");
          }
        } else {
          throw new Error(data.error || "Failed to fetch movies");
        }
      } catch (error: any) {
        toast({
          title: "Error fetching Box Office data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, [toast]);

  const filteredMovies = React.useMemo(() => {
    return allMovies
      .filter((movie) => {
        const typeMatch =
          filter === "all" || movie.origin?.toLowerCase().includes(filter);
        const searchMatch =
          searchTerm === "" ||
          movie.title.toLowerCase().includes(searchTerm.toLowerCase());
        const yearMatch =
          year === "All" ||
          (movie.movieReleaseDate &&
            new Date(movie.movieReleaseDate).getFullYear() === parseInt(year));
        return typeMatch && searchMatch && yearMatch;
      })
      .slice(0, 10); // Limit to 10 rows for display
  }, [allMovies, filter, searchTerm, year]);

  return (
    <Card className="custom-card-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Box Office Report
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All Movies
            </Button>
            <Button
              variant={filter === "hollywood" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("hollywood")}
            >
              Hollywood
            </Button>
            <Button
              variant={filter === "bollywood" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("bollywood")}
            >
              Bollywood
            </Button>
            <Button
              variant={filter === "tollywood" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("tollywood")}
            >
              Tollywood
            </Button>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <Select value={year} onValueChange={setYear} disabled={isLoading}>
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
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movie Name</TableHead>
                  <TableHead>Box Office Collection</TableHead>
                  <TableHead>Budget (Cost + P&A)</TableHead>
                  <TableHead>Verdict</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovies.map((movie) => (
                  <TableRow key={movie._id}>
                    <TableCell className="font-medium">{movie.title}</TableCell>
                    <TableCell>{formatCurrency(movie.earnings)}</TableCell>
                    <TableCell>{formatCurrency(movie.budget)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getVerdict(movie) === "Blockbuster" ||
                          getVerdict(movie) === "Hit"
                            ? "default"
                            : getVerdict(movie) === "Average"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {getVerdict(movie)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No movies found for the selected filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
