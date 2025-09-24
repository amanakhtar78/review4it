"use client";

import * as React from "react";
import type {
  Movie,
  CountryEarning,
  Song,
  ExcitementLevel,
  SuccessLevel,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RatingBadge from "@/components/movies/RatingBadge";
import GaugeMeter from "@/components/movies/GaugeMeter";
import FinancialChart from "@/components/charts/FinancialChart";
import ActorAvatar from "@/components/movies/ActorAvatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlayCircle,
  Info,
  Users,
  Lightbulb,
  LucideNewspaper,
  CalendarDays,
  Tv2,
  Wallet,
  TrendingUp,
  BarChart,
  Film,
  MessageCircle,
  Star,
  Music,
  Mic,
  DollarSign,
  Eye,
  Headphones,
  MoreHorizontal,
  CalendarClock,
  GanttChartSquare,
  AreaChart,
  Ticket,
  Table as TableIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO, isValid } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/context/CurrencyContext";
import MovieActionBar from "./MovieActionBar";

const DAILY_EARNINGS_MOBILE_SEGMENT_SIZE = 7;

interface MovieClientPageProps {
  movie: Movie;
}

export default function MovieClientPage({ movie }: MovieClientPageProps) {
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] =
    React.useState(false);
  const [isSongsDialogOpen, setIsSongsDialogOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [dailyEarningsSegment, setDailyEarningsSegment] = React.useState<
    "1-7" | "8-14"
  >("1-7");
  const [trendsTab, setTrendsTab] = React.useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [trendsView, setTrendsView] = React.useState<"chart" | "table">(
    "chart"
  );
  const [actorsEarningsView, setActorsEarningsView] = React.useState<
    "chart" | "table"
  >("chart");
  const [countryEarningsView, setCountryEarningsView] = React.useState<
    "chart" | "table"
  >("chart");
  const { formatCurrency } = useCurrency();

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!movie) {
    return (
      <div className="text-center py-10">Movie data is not available.</div>
    );
  }

  const movieId = movie._id;

  const budgetVsEarningsData = [
    { name: "Budget", value: movie.budget || 0, fill: "hsl(var(--chart-2))" },
    {
      name: "Earnings",
      value: movie.earnings || 0,
      fill: "hsl(var(--chart-1))",
    },
  ];

  const criticsBreakdownData = [
    {
      name: "Critics Score",
      value: movie.criticsScore || 0,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "Audience Score",
      value: movie.audienceScore || 0,
      fill: "hsl(var(--chart-2))",
    },
    {
      name: "Box Office",
      value: movie.boxOfficeScore || 0,
      fill: "hsl(var(--chart-3))",
    },
    {
      name: "Social Buzz",
      value: parseInt(movie.socialBuzz || "0"),
      fill: "hsl(var(--chart-4))",
    },
  ];

  const parseTrendsForChart = (
    trends: Record<string, number> | undefined,
    fill: string
  ) => {
    if (!trends) return [];
    return Object.entries(trends).map(([key, value]) => {
      const name = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      return { name, value, fill };
    });
  };

  const dailyEarningsBase = parseTrendsForChart(
    movie.boxOfficeTrends?.daily,
    "hsl(var(--chart-4))"
  );
  const weeklyEarningsChartData = parseTrendsForChart(
    movie.boxOfficeTrends?.weekly,
    "hsl(var(--chart-3))"
  );
  const monthlyEarningsChartData = parseTrendsForChart(
    movie.boxOfficeTrends?.monthly,
    "hsl(var(--chart-5))"
  );

  let dailyEarningsChartTitle = "Daily Earnings (First 14 Days)";
  let segmentedDailyEarningsData = dailyEarningsBase.slice(0, 14);

  if (isMobile) {
    if (dailyEarningsSegment === "1-7") {
      segmentedDailyEarningsData = dailyEarningsBase.slice(
        0,
        DAILY_EARNINGS_MOBILE_SEGMENT_SIZE
      );
      dailyEarningsChartTitle = "Daily Earnings (Days 1-7)";
    } else {
      segmentedDailyEarningsData = dailyEarningsBase.slice(
        DAILY_EARNINGS_MOBILE_SEGMENT_SIZE,
        DAILY_EARNINGS_MOBILE_SEGMENT_SIZE * 2
      );
      dailyEarningsChartTitle = "Daily Earnings (Days 8-14)";
    }
  }

  // Actor-wise payments fetched from API by movieId; join with movie.actors for image/character
  const [actorEarnings, setActorEarnings] = React.useState<
    Array<{ actorName?: string; actorId: string; payment: number }>
  >([]);
  const [topActorsForCards, setTopActorsForCards] = React.useState<
    Array<{
      id: string;
      name: string;
      imageUrl?: string;
      characterName?: string;
      earnings?: number;
    }>
  >([]);
  React.useEffect(() => {
    const loadActorEarnings = async () => {
      try {
        if (!movieId) return;
        const records = await (
          await import("@/lib/api")
        ).topActorEarningsApi.getByMovie(String(movieId));
        setActorEarnings(records || []);

        // Build top 15 for cards using earnings API and enrich with movie.actors
        const castIndex = new Map<string, any>();
        (movie.actors || []).forEach((a: any) => castIndex.set(a.id, a));
        const enriched = (records || [])
          .slice() // copy
          .sort((a: any, b: any) => (b.payment ?? 0) - (a.payment ?? 0))
          .slice(0, 15)
          .map((r: any) => {
            const cast = castIndex.get(r.actorId);
            return {
              id: r.actorId,
              name: r.actorName || cast?.name || r.actorId,
              imageUrl: cast?.imageUrl,
              characterName: cast?.characterName,
              earnings: r.payment ?? 0,
            };
          });
        setTopActorsForCards(enriched);
      } catch (e) {
        setActorEarnings([]);
        setTopActorsForCards([]);
      }
    };
    loadActorEarnings();
  }, [movieId]);

  const topActorsByEarnings = [...(actorEarnings || [])]
    .sort((a, b) => (b.payment ?? 0) - (a.payment ?? 0))
    .slice(0, 10)
    .map((item, index) => ({
      name: item.actorName || item.actorId,
      value: item.payment || 0,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }));

  // Country earnings fetched from API by movieId
  const [countryEarnings, setCountryEarnings] = React.useState<
    Array<{ countryId: string; payment: number }>
  >([]);
  React.useEffect(() => {
    const loadCountryEarnings = async () => {
      try {
        if (!movieId) return;
        const records = await (
          await import("@/lib/api")
        ).countryEarningsApi.getByMovie(String(movieId));
        setCountryEarnings(records || []);
      } catch (e) {
        // silent fail for UI; optional toast can be added later
        setCountryEarnings([]);
      }
    };
    loadCountryEarnings();
  }, [movieId]);

  const { countries } = require("@/data/countries");
  const countryNameMap = new Map<string, string>(
    countries.map((c: any) => [c.code, c.name])
  );

  const countryWiseEarningsChartData = [...(countryEarnings || [])]
    .sort((a: any, b: any) => (b.payment ?? 0) - (a.payment ?? 0))
    .slice(0, 10)
    .map((item: any, index: number) => ({
      name: countryNameMap.get(item.countryId) || item.countryId || "Unknown",
      value: item.payment || 0,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }));

  // Parse ticket price (stored as INR like "200rs") and display in INR
  const ticketPriceINR = React.useMemo(() => {
    if (!movie.ticketPrice) return null;

    // Extract all numbers from the string
    const matches = String(movie.ticketPrice).match(/\d+(\.\d+)?/g);

    if (!matches) return null;

    // Convert matches to numbers
    const numbers = matches
      .map((num) => Number(num))
      .filter((n) => isFinite(n));

    if (numbers.length === 0) return null;

    // Format as INR
    const formatted = numbers.map((n) => `₹${n.toLocaleString("en-IN")}`);

    // If only one number → show single
    if (formatted.length === 1) {
      return formatted[0];
    }

    // If two numbers → show as range
    if (formatted.length === 2) {
      return `${formatted[0]} - ${formatted[1]}`;
    }

    // If more than two, just join
    return formatted.join(" - ");
  }, [movie.ticketPrice]);

  const movieRatings: { source: string; value: string }[] = [];
  if (movie.ratings?.imdb)
    movieRatings.push({ source: "IMDb", value: `${movie.ratings.imdb}/10` });
  if (movie.ratings?.google)
    movieRatings.push({
      source: "Google Users",
      value: `${movie.ratings.google}%`,
    });
  if (movie.ratings?.rottenTomato)
    movieRatings.push({
      source: "Rotten Tomatoes",
      value: `${movie.ratings.rottenTomato}%`,
    });
  if (movie.ratings?.review4All)
    movieRatings.push({
      source: "Review4All",
      value: `${movie.ratings.review4All}/10`,
    });

  const excitementValueMap: Record<string, number> = {
    Low: 25,
    Medium: 50,
    High: 85,
  };
  const performanceValueMap: Record<string, number> = {
    Disaster: 10,
    Flop: 30,
    Average: 50,
    Hit: 75,
    Blockbuster: 95,
  };

  const renderTrendsTable = () => {
    let data;
    let headers: [string, string] = ["Period", "Amount"];
    switch (trendsTab) {
      case "daily":
        data = isMobile
          ? dailyEarningsSegment === "1-7"
            ? dailyEarningsBase.slice(0, 7)
            : dailyEarningsBase.slice(7, 14)
          : dailyEarningsBase.slice(0, 14);
        headers = ["Day", "Amount"];
        break;
      case "weekly":
        data = weeklyEarningsChartData;
        headers = ["Week", "Amount"];
        break;
      case "monthly":
        data = monthlyEarningsChartData;
        headers = ["Month", "Amount"];
        break;
      default:
        data = [];
    }

    if (!data || data.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">
          No data available for this period.
        </p>
      );
    }

    return (
      <ScrollArea className="h-72">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{headers[0]}</TableHead>
              <TableHead className="text-right">{headers[1]}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

  const bannerImageSrc = isMobile
    ? movie.bannerVertical || movie.bannerHorizontal || movie.image_1
    : movie.bannerHorizontal || movie.bannerVertical || movie.image_2;

  return (
    <div className="space-y-8 sm:space-y-12 md:space-y-16 pb-8 sm:pb-12 md:pb-16">
      {/* Responsive Banner Image */}
      <section className="-mx-2 sm:-mx-4 md:mx-0">
        {bannerImageSrc ? (
          <div className="relative w-full h-auto md:h-[50vh] lg:h-[60vh] custom-card-shadow overflow-hidden">
            <Image
              src={bannerImageSrc}
              alt={`${movie.title} banner`}
              width={1200}
              height={500}
              className="transition-opacity duration-500 w-full h-auto"
              priority
            />
          </div>
        ) : (
          <div className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden custom-card-shadow -mx-2 sm:-mx-4 md:mx-0 bg-muted flex items-center justify-center">
            <Film className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
      </section>

      {/* Main Info Section: Title, Desc, and Right Sidebar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {movie.title}
          </h1>
          {movie.description && (
            <>
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed line-clamp-3">
                {movie.description}
              </p>
              <Dialog
                open={isDescriptionDialogOpen}
                onOpenChange={setIsDescriptionDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Read more...
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg md:max-w-xl max-h-[80vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="font-headline text-xl sm:text-2xl">
                      {movie.title}
                    </DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="flex-grow mt-2 mb-4 pr-3">
                    <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {movie.description}
                    </p>
                  </ScrollArea>
                  <DialogFooter className="mt-auto sm:mt-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        <div className="space-y-6">
          {movie.category && movie.category.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Categories</h3>
              <div className="flex flex-wrap gap-1 sm:gap-2 ">
                {movie.category.map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="text-xs px-2 py-0.5 sm:px-3 sm:py-1"
                  >
                    {cat}
                  </Badge>
                ))}
                {movieId && <MovieActionBar movie={movie} />}
              </div>
            </div>
          )}
          <div className="flex flex-row gap-2 sm:gap-3 items-center">
            {movie.trailerLink && (
              <Button
                asChild
                size="sm"
                className="transition-transform hover:scale-105 text-xs sm:text-sm px-3"
              >
                <Link
                  href={movie.trailerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PlayCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />{" "}
                  Watch Trailer
                </Link>
              </Button>
            )}
            {movie.teaserLink && (
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="transition-transform hover:scale-105 text-xs sm:text-sm px-3"
              >
                <Link
                  href={movie.teaserLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Info className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> View
                  Teaser
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16">
          <div>
            <h2 className="text-lg sm:text-2xl font-headline font-semibold mb-3 sm:mb-4 text-foreground flex items-center">
              <Star className="mr-2 h-4 sm:h-6 w-4 sm:w-6 text-primary" />
              Ratings
            </h2>
            {movie.ratings && (
              <Table className="text-xs md:text-sm border border-grey-500 border-r-4">
                <TableHeader>
                  <TableRow>
                    {movie.ratings.imdb && (
                      <TableHead className="w-1/4">IMDb</TableHead>
                    )}
                    {movie.ratings.google && (
                      <TableHead className="w-1/4">Google&nbsp;Users</TableHead>
                    )}
                    {movie.ratings.rottenTomato && (
                      <TableHead className="w-1/4">
                        Rotten&nbsp;Tomatoes
                      </TableHead>
                    )}
                    {movie.ratings.review4All && (
                      <TableHead className="w-1/4">Review4All</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    {movie.ratings.imdb && (
                      <TableCell>{movie.ratings.imdb}/10</TableCell>
                    )}
                    {movie.ratings.google && (
                      <TableCell>{movie.ratings.google}%</TableCell>
                    )}
                    {movie.ratings.rottenTomato && (
                      <TableCell>{movie.ratings.rottenTomato}%</TableCell>
                    )}
                    {movie.ratings.review4All && (
                      <TableCell>{movie.ratings.review4All}/10</TableCell>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-headline font-semibold mb-3 sm:mb-4 text-foreground flex items-center">
              <Tv2 className="mr-2 h-4 sm:h-6 w-4 sm:w-6 text-primary" />
              Streaming Info
            </h2>
            <Table className="text-xs md:text-sm border border-grey-500 border-r-4">
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Released&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </TableHead>
                  <TableHead>OTT&nbsp;Expected</TableHead>
                  <TableHead>OTT&nbsp;Released</TableHead>
                  <TableHead>Streaming&nbsp;At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    {movie.movieReleaseDate &&
                    isValid(parseISO(movie.movieReleaseDate))
                      ? format(parseISO(movie.movieReleaseDate), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {movie.ottExpectedReleaseDate &&
                    isValid(parseISO(movie.ottExpectedReleaseDate))
                      ? format(
                          parseISO(movie.ottExpectedReleaseDate),
                          "MMM d, yyyy"
                        )
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {movie.ottReleaseDate &&
                    isValid(parseISO(movie.ottReleaseDate))
                      ? format(parseISO(movie.ottReleaseDate), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{movie.ottStreamingAt || "N/A"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
      <section className="px-1 sm:px-0">
        <div className="space-y-8">
          <div className="flex items-end justify-between md:flex-row-reverse flex-wrap ">
            <section className="flex gap-5 items-center justify-between w-full md:w-auto">
              {movie.excitementLevel && (
                <div className="flex flex-col items-center gap-1">
                  <GaugeMeter
                    label="Excitement Level"
                    value={movie.excitementLevel}
                    levels={[
                      { name: "Low", color: "stroke-sky-500" },
                      { name: "Medium", color: "stroke-yellow-500" },
                      { name: "High", color: "stroke-red-500" },
                    ]}
                  />
                  <p className="font-semibold text-lg text-foreground">
                    {movie.excitementLevel}%
                  </p>
                </div>
              )}
              {movie.performanceMeter && (
                <div className="flex flex-col items-center gap-1">
                  <GaugeMeter
                    label="Performance Meter"
                    value={performanceValueMap[movie.performanceMeter] || 0}
                    levels={[
                      { name: "Disaster", color: "stroke-red-800" },
                      { name: "Flop", color: "stroke-orange-600" },
                      { name: "Average", color: "stroke-yellow-500" },
                      { name: "Hit", color: "stroke-lime-500" },
                      { name: "Blockbuster", color: "stroke-green-600" },
                    ]}
                  />
                  <p className="font-semibold text-lg text-foreground">
                    {movie.performanceMeter}
                  </p>
                </div>
              )}
            </section>{" "}
            <aside>
              {" "}
              <h2 className="text-lg sm:text-2xl font-headline font-semibold mb-4 text-foreground flex items-center">
                <Wallet className="mr-2 h-4 sm:h-6 w-4 sm:w-6 text-primary" />
                Financials Overview
              </h2>
              <div className="flex items-center space-x-4 overflow-auto w-full md:w-auto">
                <div className="flex items-center space-x-2 p-2 border bg-secondary/50 custom-badge-style">
                  <Wallet className="h-5 w-5 text-muted-foreground hidden md:block" />
                  <div>
                    <p className="text-base sm:text-lg font-bold text-foreground leading-tight">
                      {formatCurrency(movie.budget)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Budget
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 border bg-secondary/50 custom-badge-style">
                  <TrendingUp className="h-5 w-5 text-muted-foreground hidden md:block" />
                  <div>
                    <p className="text-base sm:text-lg font-bold text-foreground leading-tight">
                      {formatCurrency(movie.earnings)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Earnings
                    </p>
                  </div>
                </div>
                {movie.ticketPrice && (
                  <div className="flex items-center space-x-2 p-2 border bg-secondary/50 custom-badge-style">
                    <Ticket className="h-5 w-5 text-muted-foreground hidden md:block" />
                    <div>
                      <p className="text-base sm:text-lg font-bold text-foreground leading-tight">
                        {ticketPriceINR ?? "₹"}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Ticket Price
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <FinancialChart
              title="Budget vs. Earnings"
              data={budgetVsEarningsData}
              description="A comparison of the movie's budget and total earnings."
              chartTypeConfig={{ bar: true, pie: true }}
            />
            <FinancialChart
              title="Critics Breakdown"
              data={criticsBreakdownData}
              description="Aggregated scores across different metrics (out of 100)."
            />
          </div>
        </div>
      </section>
      {movie.actors && movie.actors.length > 0 && (
        <section>
          <h2 className="text-lg sm:text-2xl font-headline font-semibold mb-4 text-foreground flex items-center">
            <Users className="mr-2 h-4 sm:h-6 w-4 sm:w-6 text-primary" />
            Cast
          </h2>
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="w-full whitespace-nowrap pb-3">
                <div className="flex space-x-3 sm:space-x-6">
                  {movie.actors.map((actor) => (
                    <ActorAvatar key={actor.id} actor={actor} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      )}

      {topActorsForCards && topActorsForCards.length > 0 && (
        <section className="px-1 sm:px-0">
          <h2 className="text-lg sm:text-2xl font-headline font-semibold mb-4 text-foreground flex items-center">
            <Users className="mr-2 h-4 sm:h-6 w-4 sm:w-6 text-primary" />
            Top Actors (by earnings)
          </h2>
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="w-full whitespace-nowrap pb-3">
                <div className="flex space-x-3 sm:space-x-6">
                  {topActorsForCards.map((actor) => (
                    <ActorAvatar key={actor.id} actor={actor as any} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="px-1 sm:px-0">
        <Tabs
          value={trendsTab}
          onValueChange={(v) => setTrendsTab(v as any)}
          className="w-full"
        >
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className="font-headline text-md sm:text-xl flex items-center">
                  <BarChart className="mr-2 h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                  Box Office Trends
                </CardTitle>
                <div className="flex items-center gap-2">
                  <TabsList className="grid w-full grid-cols-3 sm:w-auto h-9 text-xs sm:h-10 sm:text-sm">
                    <TabsTrigger
                      value="daily"
                      className="flex items-center gap-1.5 px-2 sm:px-3"
                    >
                      <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4" />
                      Daily
                    </TabsTrigger>
                    <TabsTrigger
                      value="weekly"
                      className="flex items-center gap-1.5 px-2 sm:px-3"
                    >
                      <GanttChartSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger
                      value="monthly"
                      className="flex items-center gap-1.5 px-2 sm:px-3"
                    >
                      <AreaChart className="h-3 w-3 sm:h-4 sm:w-4" />
                      Monthly
                    </TabsTrigger>
                  </TabsList>
                  <Tabs
                    value={trendsView}
                    onValueChange={(v) => setTrendsView(v as any)}
                    className="w-auto"
                  >
                    <TabsList className="grid grid-cols-2 h-9 text-xs sm:h-10 sm:text-sm">
                      <TabsTrigger
                        value="chart"
                        className="flex items-center gap-1.5 px-2 sm:px-3"
                      >
                        <BarChart className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Chart</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="table"
                        className="flex items-center gap-1.5 px-2 sm:px-3"
                      >
                        <TableIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Table</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 sm:p-4 sm:pt-0">
              {trendsView === "chart" ? (
                <>
                  <TabsContent value="daily">
                    {isMobile &&
                      dailyEarningsBase.length >
                        DAILY_EARNINGS_MOBILE_SEGMENT_SIZE && (
                        <Tabs
                          value={dailyEarningsSegment}
                          onValueChange={(v) =>
                            setDailyEarningsSegment(v as "1-7" | "8-14")
                          }
                          className="w-full mt-2 mb-4"
                        >
                          <TabsList className="grid w-full grid-cols-2 h-8 text-xs">
                            <TabsTrigger value="1-7">Days 1-7</TabsTrigger>
                            <TabsTrigger value="8-14">Days 8-14</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      )}
                    {segmentedDailyEarningsData.length > 0 ? (
                      <FinancialChart
                        noCardCustomShadow={true}
                        title={
                          isMobile
                            ? dailyEarningsChartTitle
                            : "Daily Earnings (First 14 Days)"
                        }
                        data={segmentedDailyEarningsData}
                        chartTypeConfig={{ bar: true, pie: false }}
                        defaultChartType="bar"
                        description={
                          isMobile
                            ? `Box office collection for days ${
                                dailyEarningsSegment === "1-7" ? "1-7" : "8-14"
                              }.`
                            : "Box office collection for the initial two weeks."
                        }
                      />
                    ) : (
                      <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">
                        No daily earnings data available.
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="weekly">
                    {weeklyEarningsChartData.length > 0 ? (
                      <FinancialChart
                        noCardCustomShadow={true}
                        title="Weekly Earnings"
                        data={weeklyEarningsChartData}
                        chartTypeConfig={{ bar: true, pie: false }}
                        defaultChartType="bar"
                        description="Box office trends on a weekly basis."
                      />
                    ) : (
                      <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">
                        No weekly earnings data available.
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="monthly">
                    {monthlyEarningsChartData.length > 0 ? (
                      <FinancialChart
                        noCardCustomShadow={true}
                        title="Monthly Earnings"
                        data={monthlyEarningsChartData}
                        chartTypeConfig={{ bar: true, pie: false }}
                        defaultChartType="bar"
                        description="Box office trends on a monthly basis."
                      />
                    ) : (
                      <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">
                        No monthly earnings data available.
                      </p>
                    )}
                  </TabsContent>
                </>
              ) : (
                renderTrendsTable()
              )}
            </CardContent>
          </Card>
        </Tabs>
      </section>

      <section className="px-1 sm:px-0 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
        {topActorsByEarnings.length > 0 && (
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-headline text-md sm:text-xl flex items-center">
                  <Users className="mr-2 h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                  Top Actors' Earnings
                </CardTitle>
                <Tabs
                  value={actorsEarningsView}
                  onValueChange={(v) => setActorsEarningsView(v as any)}
                  className="w-auto"
                >
                  <TabsList className="grid grid-cols-2 h-9 text-xs sm:h-10 sm:text-sm">
                    <TabsTrigger
                      value="chart"
                      className="flex items-center gap-1.5"
                    >
                      <BarChart className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="table"
                      className="flex items-center gap-1.5"
                    >
                      <TableIcon className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 sm:p-4 sm:pt-0">
              {actorsEarningsView === "chart" ? (
                <FinancialChart
                  noCardCustomShadow={true}
                  title=""
                  data={topActorsByEarnings}
                  description="Estimated earnings of the top-billed actors for this movie."
                />
              ) : (
                <ScrollArea className="h-72">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Actor</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topActorsByEarnings.map((actor) => (
                        <TableRow key={actor.name}>
                          <TableCell>{actor.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(actor.value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}
        {countryWiseEarningsChartData.length > 0 && (
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-headline text-md sm:text-xl flex items-center">
                  <TrendingUp className="mr-2 h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                  Earnings by Country
                </CardTitle>
                <Tabs
                  value={countryEarningsView}
                  onValueChange={(v) => setCountryEarningsView(v as any)}
                  className="w-auto"
                >
                  <TabsList className="grid grid-cols-2 h-9 text-xs sm:h-10 sm:text-sm">
                    <TabsTrigger
                      value="chart"
                      className="flex items-center gap-1.5"
                    >
                      <BarChart className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="table"
                      className="flex items-center gap-1.5"
                    >
                      <TableIcon className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 sm:p-4 sm:pt-0">
              {countryEarningsView === "chart" ? (
                <>
                  <FinancialChart
                    noCardCustomShadow={true}
                    title=""
                    data={countryWiseEarningsChartData.map((item) => ({
                      name: item.name,
                      value: item.value,
                      fill: item.fill,
                    }))}
                    description="Breakdown of total earnings by country (Top 10)."
                    chartTypeConfig={{ bar: true, pie: true }}
                    defaultChartType="bar"
                  />
                </>
              ) : (
                <ScrollArea className="h-72">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Country</TableHead>
                        <TableHead className="text-right">Earnings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countryWiseEarningsChartData.map((country) => (
                        <TableRow key={country.name}>
                          <TableCell>{country.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(country.value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {movie.soundtracks && movie.soundtracks.length > 0 && (
        <section className="px-1 sm:px-0">
          <h2 className="text-lg sm:text-2xl font-headline font-semibold mb-4 text-foreground flex items-center">
            <Music className="mr-2 h-4 sm:h-6 w-4 sm:w-6 text-primary" />
            Soundtracks
          </h2>
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="w-full whitespace-nowrap pb-3">
                <div className="flex space-x-3 sm:space-x-4 py-1">
                  {movie.soundtracks.map((song, i) => (
                    <Card
                      key={i}
                      className="w-64 p-2 flex flex-col flex-shrink-0 hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-2 pb-1">
                        <h4 className="font-semibold text-xs mb-1 line-clamp-2">
                          {song.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {song.sungBy}
                        </p>
                        {song.releaseDate &&
                          isValid(parseISO(song.releaseDate)) && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Released:{" "}
                              {format(parseISO(song.releaseDate), "PPP")}
                            </p>
                          )}
                        <div className="mt-2 grid grid-cols-1 gap-1.5 text-[11px]">
                          <div
                            className="flex items-center gap-1.5"
                            title="Earnings"
                          >
                            <DollarSign className="h-3 w-3 text-green-500" />
                            <span className="font-mono">
                              {formatCurrency(song.earned)}
                            </span>
                            <span className="text-muted-foreground">
                              earned
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1.5"
                            title="Video views"
                          >
                            <Eye className="h-3 w-3 text-blue-500" />
                            <span className="font-mono">
                              {formatCurrency(song.videoPlayedViews)}
                            </span>
                            <span className="text-muted-foreground">
                              video views
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1.5"
                            title="Streams"
                          >
                            <Headphones className="h-3 w-3 text-purple-500" />
                            <span className="font-mono">
                              {formatCurrency(song.streamTimes)}
                            </span>
                            <span className="text-muted-foreground">
                              streams
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-2 pt-0">
                        <Button
                          variant="link"
                          asChild
                          className="p-0 h-auto text-xs"
                        >
                          <Link href={song.image || "#"}>Open</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      )}

      {movie.funFacts && movie.funFacts.length > 0 && (
        <section className="px-1 sm:px-0">
          <Accordion type="single" collapsible className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-md sm:text-xl flex items-center">
                  <Lightbulb className="mr-2 h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                  Fun Facts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {movie.funFacts.map((fact, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-left">
                        {fact.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          {fact.description}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </Accordion>
        </section>
      )}

      {movie.RelatedNews && movie.RelatedNews.length > 0 && (
        <section className="px-1 sm:px-0">
          <h2 className="text-lg sm:text-2xl font-headline font-semibold mb-4 text-foreground flex items-center">
            <LucideNewspaper className="mr-2 h-4 sm:h-6 w-4 sm:w-6 text-primary" />
            Related News
          </h2>
          <Card>
            <CardContent className="p-4">
              <ScrollArea className="w-full whitespace-nowrap pb-3">
                <div className="flex space-x-3 sm:space-x-4 py-1">
                  {movie.RelatedNews.map((newsItem, i) => (
                    <Card
                      key={i}
                      className="w-64 sm:w-72 p-2 flex flex-col flex-shrink-0 hover:shadow-md transition-shadow hover:border-primary/30"
                    >
                      <CardContent className="p-2 pb-1 flex-grow">
                        <h4 className="font-semibold text-xs mb-1 line-clamp-2">
                          {newsItem.title}
                        </h4>
                        {newsItem.description && (
                          <p className="text-xs text-muted-foreground line-clamp-3">
                            {newsItem.description}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="p-2 pt-0">
                        <Button
                          variant="link"
                          asChild
                          className="p-0 h-auto text-xs"
                        >
                          <Link
                            href={newsItem.sourceLink || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Read More
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
