"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import ProfileForm from "@/components/auth/ProfileForm";
import { Skeleton } from "@/components/ui/skeleton";
import { IUser } from "@/lib/models/User";
import { movieSeriesApi, usersApi } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Bookmark, ThumbsDown, Trash2, Film } from "lucide-react";
import { Movie } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserActions } from "@/context/UserActionsContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProfilePage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
  const [dislikedMovies, setDislikedMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);
  const router = useRouter();
  const { toggleAction } = useUserActions();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.userId;
        if (userId) {
          const userData = await usersApi.getOne(userId);
          setUser(userData);
          if (
            userData.likedMovies?.length ||
            userData.savedMovies?.length ||
            userData.dislikedMovies?.length
          ) {
            fetchMovieLists(userData);
          }
        } else {
          throw new Error("User ID not found in token.");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // localStorage.removeItem('authToken'); // Let's not log out automatically
        // router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMovieLists = async (userData: IUser) => {
      setIsMoviesLoading(true);
      try {
        // This is inefficient. Ideally, the backend would provide an endpoint to fetch movies by an array of IDs.
        // For now, we fetch all and filter, which is slow but works for a small dataset.
        const allMovies = await movieSeriesApi.getAll();

        if (userData.likedMovies) {
          const liked = allMovies.filter((movie) =>
            userData.likedMovies.includes(movie._id)
          );
          setLikedMovies(liked);
        }
        if (userData.savedMovies) {
          const saved = allMovies.filter((movie) =>
            userData.savedMovies.includes(movie._id)
          );
          setSavedMovies(saved);
        }
        if (userData.dislikedMovies) {
          const disliked = allMovies.filter((movie) =>
            userData.dislikedMovies.includes(movie._id)
          );
          setDislikedMovies(disliked);
        }
      } catch (error) {
        console.error("Failed to fetch movie lists:", error);
      } finally {
        setIsMoviesLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleRemove = (
    movieId: string,
    listType: "like" | "save" | "dislike"
  ) => {
    toggleAction(movieId, listType);

    // Optimistically update the UI
    if (listType === "like") {
      setLikedMovies((prev) => prev.filter((m) => m._id !== movieId));
    } else if (listType === "save") {
      setSavedMovies((prev) => prev.filter((m) => m._id !== movieId));
    } else if (listType === "dislike") {
      setDislikedMovies((prev) => prev.filter((m) => m._id !== movieId));
    }
  };

  const renderMovieList = (
    movies: Movie[],
    listType: "like" | "save" | "dislike",
    emptyMessage: string
  ) => {
    if (isMoviesLoading) {
      return (
        <div className="space-y-3 pr-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      );
    }

    if (movies.length > 0) {
      return (
        <ScrollArea className="h-96">
          <div className="space-y-2 pr-4">
            {movies.map((movie) => (
              <div
                key={movie._id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Film className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{movie.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(movie._id, listType)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      );
    }

    return (
      <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
    );
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Your Profile</CardTitle>
          <CardDescription>
            Update your personal information and manage your movies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="liked">
                <Heart className="mr-2 h-4 w-4" /> Liked (
                {user?.likedMovies?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="saved">
                <Bookmark className="mr-2 h-4 w-4" /> Saved (
                {user?.savedMovies?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="disliked">
                <ThumbsDown className="mr-2 h-4 w-4" /> Disliked (
                {user?.dislikedMovies?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="quiz-history">
                Quiz History ({user?.quizHistory?.length || 0})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : user ? (
                <ProfileForm currentUser={user} />
              ) : (
                <p className="text-muted-foreground text-center">
                  Could not load user data.
                </p>
              )}
            </TabsContent>
            <TabsContent value="liked" className="mt-6">
              {renderMovieList(
                likedMovies,
                "like",
                "You haven't liked any movies yet."
              )}
            </TabsContent>
            <TabsContent value="saved" className="mt-6">
              {renderMovieList(
                savedMovies,
                "save",
                "You haven't saved any movies yet."
              )}
            </TabsContent>
            <TabsContent value="disliked" className="mt-6">
              {renderMovieList(
                dislikedMovies,
                "dislike",
                "You haven't disliked any movies yet."
              )}
            </TabsContent>
            <TabsContent value="quiz-history" className="mt-6">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : user?.quizHistory?.length ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quiz ID</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Answered Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.quizHistory.map((h) => (
                        <TableRow key={h._id}>
                          <TableCell className="font-mono text-xs sm:text-sm">
                            {String(h.quizId)}
                          </TableCell>
                          <TableCell>{h.score}</TableCell>
                          <TableCell>
                            {new Date(h.answeredDate).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No past quiz history.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
