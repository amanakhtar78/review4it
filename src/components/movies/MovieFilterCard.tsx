import Link from "next/link";
import Image from "next/image";
import type { Movie } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface MovieFilterCardProps {
  movie: Movie;
  rank?: number;
}

export default function MovieFilterCard({ movie, rank }: MovieFilterCardProps) {
  const { formatCurrency } = useCurrency();
  const earnings = movie.earnings ?? 0;
  const budget = movie.budget ?? 0;
  const profit = earnings - budget;
  const roi = movie.roi ?? (budget > 0 ? (profit / budget) * 100 : 0);

  // For the progress bar, we want to show profit relative to budget.
  // If profit is positive, it's a gain. If negative, it's a loss.
  // We can represent this as a percentage of the budget.
  const profitPercentageOfBudget = budget > 0 ? (profit / budget) * 100 : 0;

  // Progress bar should show 0-100. Let's cap it for visualization.
  // We can show a 50% base for breakeven.
  const progressBarValue = 50 + profitPercentageOfBudget / 2; // Simple visualization
  const cappedProgress = Math.max(0, Math.min(100, progressBarValue));

  return (
    <Link href={`/movies/${movie._id}`} className="block group">
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl hover:border-primary/50">
        <CardHeader className="p-0 relative h-[200px]">
          {movie.bannerVertical || movie.image_1 ? (
            <Image
              src={movie.bannerVertical || movie.image_1!}
              alt={movie.title}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
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
              className="absolute top-2 left-2 z-10 bg-black/70 text-white text-lg font-bold w-10 h-10 flex items-center justify-center rounded-full"
            >
              #{rank}
            </Badge>
          )}
          <div className="absolute bottom-2 right-2 z-10">
            <Badge
              variant={roi >= 0 ? "default" : "destructive"}
              className="flex items-center gap-1 text-sm"
            >
              {roi >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {roi.toFixed(0)}% ROI
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 flex-grow">
          <CardTitle className="font-headline text-lg mb-2 leading-tight group-hover:text-primary transition-colors truncate">
            {movie.title}
          </CardTitle>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-green-500 font-semibold">Earnings</span>
              <span className="font-mono">{formatCurrency(earnings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-500 font-semibold">Budget</span>
              <span className="font-mono">{formatCurrency(budget)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
