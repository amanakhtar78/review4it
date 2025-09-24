
"use client";

import * as React from 'react';
import { Heart, Bookmark, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import MainLoginForm from '../auth/MainLoginForm';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Movie } from '@/types';
import { useUserActions } from '@/context/UserActionsContext';


interface MovieActionBarProps {
  movie: Partial<Movie>;
}

export default function MovieActionBar({ movie }: MovieActionBarProps) {
  const { 
    isLoggedIn, 
    userId, 
    isLoading: isUserActionsLoading, 
    isMovieLiked, 
    isMovieSaved, 
    isMovieDisliked, 
    toggleAction: toggleContextAction 
  } = useUserActions();
  
  const [counts, setCounts] = React.useState({
    likes: movie.likes || 0,
    saves: movie.saves || 0,
    dislikes: movie.dislikes || 0,
  });

  const { toast } = useToast();
  const movieId = movie._id;

  // This effect ensures that if the movie prop updates from the parent, the counts are synced.
  React.useEffect(() => {
    setCounts({
      likes: movie.likes || 0,
      saves: movie.saves || 0,
      dislikes: movie.dislikes || 0,
    });
  }, [movie.likes, movie.saves, movie.dislikes]);


  const handleAction = async (actionType: 'like' | 'save' | 'dislike') => {
    if (!userId || !movieId) return;

    // --- Start Optimistic Update ---
    // 1. Update the central context so other components know about the change immediately.
    toggleContextAction(movieId, actionType);

    // 2. Update local state for immediate visual feedback.
    setCounts(prevCounts => {
        const field = `${actionType}s` as keyof typeof prevCounts;
        const currentSet = actionType === 'like' ? isMovieLiked(movieId) : actionType === 'save' ? isMovieSaved(movieId) : isMovieDisliked(movieId);
        // If it's already set, we are removing it, so decrement. Otherwise, increment.
        const change = currentSet ? -1 : 1;
        
        return {
            ...prevCounts,
            [field]: Math.max(0, prevCounts[field] + change) // Ensure count doesn't go below 0
        };
    });
    // --- End Optimistic Update ---


    try {
      // 3. Make the API call in the background. We don't use the response to update state
      //    to prevent the "jumping" UI, as the optimistic update has already handled it.
      await usersApi.updateUserAction({ userId, movieId, actionType });
      
    } catch (error: any) {
      // 4. If the API call fails, revert the optimistic updates.
      toggleContextAction(movieId, actionType); // Revert context state

      setCounts(prevCounts => {
         const field = `${actionType}s` as keyof typeof prevCounts;
         const currentSet = actionType === 'like' ? isMovieLiked(movieId) : actionType === 'save' ? isMovieSaved(movieId) : isMovieDisliked(movieId);
         const change = currentSet ? -1 : 1; // This is the change that was applied, so we reverse it.
         
         return {
            ...prevCounts,
            [field]: Math.max(0, prevCounts[field] - change)
         };
      });

      toast({
        title: 'Error',
        description: error.message || `Could not update your preference.`,
        variant: 'destructive',
      });
    }
  };

  const ActionButton = ({
    actionType,
    isSet,
    count,
    Icon,
    className = "",
  }: {
    actionType: 'like' | 'save' | 'dislike';
    isSet: boolean;
    count: number;
    Icon: React.ElementType;
    className?: string;
  }) => (
    <div className="flex flex-col items-center gap-1">
        <Button
        variant="ghost"
        size="icon"
        onClick={() => handleAction(actionType)}
        className={cn("rounded-full h-8 w-8", className)}
        aria-label={`${actionType} movie`}
        >
        <Icon className={cn("h-4 w-4 transition-colors", isSet ? 'text-primary fill-primary' : 'text-muted-foreground')} />
        </Button>
        <span className="text-xs text-muted-foreground font-mono">{count}</span>
    </div>
  );


  if (isUserActionsLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-10 w-16" />
      </div>
    );
  }

  const buttons = (
    <>
      <ActionButton actionType="like" isSet={isMovieLiked(movieId!)} count={counts.likes} Icon={Heart} className="hover:bg-rose-100 dark:hover:bg-rose-900/50" />
      <ActionButton actionType="save" isSet={isMovieSaved(movieId!)} count={counts.saves} Icon={Bookmark} className="hover:bg-sky-100 dark:hover:bg-sky-900/50" />
      <ActionButton actionType="dislike" isSet={isMovieDisliked(movieId!)} count={counts.dislikes} Icon={ThumbsDown} className="hover:bg-slate-200 dark:hover:bg-slate-700/50" />
    </>
  );

  if (!isLoggedIn) {
     return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><Heart className="h-4 w-4 text-muted-foreground" /></Button>
                        <span className="text-xs text-muted-foreground font-mono">{counts.likes || 0}</span>
                    </div>
                     <div className="flex flex-col items-center gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><Bookmark className="h-4 w-4 text-muted-foreground" /></Button>
                        <span className="text-xs text-muted-foreground font-mono">{counts.saves || 0}</span>
                    </div>
                     <div className="flex flex-col items-center gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><ThumbsDown className="h-4 w-4 text-muted-foreground" /></Button>
                        <span className="text-xs text-muted-foreground font-mono">{counts.dislikes || 0}</span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Join Cinefolio!</DialogTitle>
                    <DialogDescription>
                        Please log in to like, save, and dislike movies.
                    </DialogDescription>
                </DialogHeader>
                <MainLoginForm />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                    Sign up
                    </Link>
                </p>
            </DialogContent>
        </Dialog>
     )
  }

  return <div className="flex items-center gap-1 sm:gap-2">{buttons}</div>;
}
