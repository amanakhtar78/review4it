
"use client";

import * as React from 'react';
import { usersApi } from '@/lib/api';
import type { IQuizHistory, IUser } from '@/lib/models/User';
import { useToast } from '@/hooks/use-toast';
import { isToday } from 'date-fns';


type ActionType = 'like' | 'save' | 'dislike';

interface UserActionsState {
  likedMovies: Set<string>;
  savedMovies: Set<string>;
  dislikedMovies: Set<string>;
}

interface UserActionsContextType {
  isLoggedIn: boolean;
  userId: string | null;
  lastQuizDate: Date | null;
  quizHistory: IQuizHistory[];
  isLoading: boolean;
  isMovieLiked: (movieId: string) => boolean;
  isMovieSaved: (movieId: string) => boolean;
  isMovieDisliked: (movieId: string) => boolean;
  hasPlayedQuizToday: (quizId: string) => boolean;
  toggleAction: (movieId: string, actionType: ActionType) => void;
}

const UserActionsContext = React.createContext<UserActionsContextType | undefined>(undefined);

export const UserActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [lastQuizDate, setLastQuizDate] = React.useState<Date | null>(null);
  const [quizHistory, setQuizHistory] = React.useState<IQuizHistory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionsState, setActionsState] = React.useState<UserActionsState>({
    likedMovies: new Set(),
    savedMovies: new Set(),
    dislikedMovies: new Set(),
  });
  const { toast } = useToast();

  React.useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentUserId = payload.userId;
          setUserId(currentUserId);
          setIsLoggedIn(true);

          const user = await usersApi.getOne(currentUserId);
          setActionsState({
            likedMovies: new Set(user.likedMovies || []),
            savedMovies: new Set(user.savedMovies || []),
            dislikedMovies: new Set(user.dislikedMovies || []),
          });
          setLastQuizDate(user.lastQuizAnsweredDate ? new Date(user.lastQuizAnsweredDate) : null);
          setQuizHistory(user.quizHistory || []);
        } catch (error) {
          console.error("Failed to parse token or fetch user data:", error);
          localStorage.removeItem('authToken');
          setIsLoggedIn(false);
          setUserId(null);
        }
      }
      setIsLoading(false);
    };

    checkUserStatus();
  }, []);

  const isMovieLiked = (movieId: string) => actionsState.likedMovies.has(movieId);
  const isMovieSaved = (movieId: string) => actionsState.savedMovies.has(movieId);
  const isMovieDisliked = (movieId: string) => actionsState.dislikedMovies.has(movieId);
  
  const hasPlayedQuizToday = (quizId: string) => {
    return quizHistory.some(historyItem => 
      historyItem.quizId.toString() === quizId && isToday(new Date(historyItem.answeredDate))
    );
  };

  const toggleAction = (movieId: string, actionType: ActionType) => {
    if (!userId) return;

    const actionMap = {
      like: 'likedMovies',
      save: 'savedMovies',
      dislike: 'dislikedMovies'
    } as const;

    const userListKey = actionMap[actionType];
    const isCurrentlySet = actionsState[userListKey].has(movieId);
    
    // --- Start Optimistic UI Update ---
    setActionsState(prevState => {
      const newList = new Set(prevState[userListKey]);
      if (isCurrentlySet) {
        newList.delete(movieId);
      } else {
        newList.add(movieId);
      }
      return { ...prevState, [userListKey]: newList };
    });
    // --- End Optimistic UI Update ---


    // --- API Call ---
    const apiCall = isCurrentlySet 
      ? usersApi.removeUserAction({ userId, movieId, actionType }) 
      : usersApi.updateUserAction({ userId, movieId, actionType });

    apiCall.catch((error) => {
      // If the API call fails, revert the optimistic change and notify the user.
      setActionsState(prevState => {
        const revertedList = new Set(prevState[userListKey]);
        if (isCurrentlySet) {
          revertedList.add(movieId); // Re-add if the original action was a removal
        } else {
          revertedList.delete(movieId); // Remove if the original action was an addition
        }
        return { ...prevState, [userListKey]: revertedList };
      });

      toast({
        title: 'Error',
        description: `Could not update your preference: ${error.message}`,
        variant: 'destructive',
      });
    });
  };

  const value = {
    isLoggedIn,
    userId,
    isLoading,
    lastQuizDate,
    quizHistory,
    isMovieLiked,
    isMovieSaved,
    isMovieDisliked,
    hasPlayedQuizToday,
    toggleAction,
  };

  return (
    <UserActionsContext.Provider value={value}>
      {children}
    </UserActionsContext.Provider>
  );
};

export const useUserActions = () => {
  const context = React.useContext(UserActionsContext);
  if (context === undefined) {
    throw new Error('useUserActions must be used within a UserActionsProvider');
  }
  return context;
};
