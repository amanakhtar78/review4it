import type { Rating } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Percent, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingBadgeProps {
  rating: Rating;
}

const getIconForSource = (source: string) => {
  if (source.toLowerCase().includes('imdb')) return <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />;
  if (source.toLowerCase().includes('google')) return <CheckCircle className="w-3 h-3 text-blue-500" />;
  if (source.toLowerCase().includes('rotten')) return <Percent className="w-3 h-3 text-red-500" />; 
  return <Star className="w-3 h-3 text-gray-400" />;
};

export default function RatingBadge({ rating }: RatingBadgeProps) {
  return (
    <div className={cn(
      "flex items-center space-x-1.5 p-2 border bg-secondary/50 rounded-md",
    )}>
      {getIconForSource(rating.source)}
      <div>
        <p className="text-xs font-medium text-foreground">{rating.value}</p>
        <p className="text-[10px] text-muted-foreground">{rating.source}</p>
      </div>
    </div>
  );
}
