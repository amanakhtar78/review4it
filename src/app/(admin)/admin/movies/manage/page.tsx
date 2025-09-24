
"use client";

import * as React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { Edit3, PlusCircle, Trash2, Film } from 'lucide-react';
import type { Movie } from '@/types';
import MovieForm from '@/components/admin/forms/MovieForm';
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { movieSeriesApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageMoviesPage() {
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [editingMovie, setEditingMovie] = React.useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = React.useState<Movie | null>(null);
  const { toast } = useToast();

  const fetchMovies = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await movieSeriesApi.getAll();
      setMovies(data);
    } catch (error) {
      toast({
        title: "Error fetching movies",
        description: "Could not fetch movie list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleOpenFormDialog = (movie?: Movie) => {
    setEditingMovie(movie || null);
    setIsFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setEditingMovie(null);
    setIsFormDialogOpen(false);
  };

  const handleSaveMovie = async (data: Movie) => {
    try {
      if (editingMovie?._id) {
        await movieSeriesApi.update(editingMovie._id, data);
        toast({ title: "Movie Updated", description: `"${data.title}" has been successfully updated.` });
      } else {
        await movieSeriesApi.create(data);
        toast({ title: "Movie Added", description: `"${data.title}" has been successfully added.` });
      }
      handleCloseFormDialog();
      fetchMovies(); // Re-fetch data
    } catch (error: any) {
       toast({
        title: "Save Error",
        description: error.message || "Could not save the movie. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMovie = async (movie: Movie) => {
    if (!movie._id) return;
    try {
       await movieSeriesApi.delete(movie._id);
       toast({ title: "Movie Deleted", description: `"${movie.title}" has been deleted.`, variant: "destructive" });
       fetchMovies();
    } catch (error: any) {
       toast({
        title: "Delete Error",
        description: error.message || "Could not delete the movie. Please try again.",
        variant: "destructive"
      });
    } finally {
        setMovieToDelete(null); // Close alert dialog
    }
  };

  return (
    <div>
      <PageHeader 
        title="Manage Movies" 
        description="View, edit, or delete existing movies from the database." 
        icon={Edit3}
        action={
          <Button onClick={() => handleOpenFormDialog()} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Movie
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Movie List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : movies.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead className="w-[50px]">Poster</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {movies.map((movie) => (
                    <TableRow key={movie._id}>
                      <TableCell>
                        {(movie as any).image_1 ? (
                          <img src={(movie as any).image_1} alt={movie.title} className="h-16 w-12 object-cover rounded-sm" />
                        ) : (
                          <div className="h-16 w-12 bg-muted rounded-sm flex items-center justify-center text-xs text-muted-foreground"><Film className="h-6 w-6"/></div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{movie.title}</TableCell>
                      <TableCell>{movie.movieReleaseDate ? new Date(movie.movieReleaseDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{movie.origin || 'N/A'}</TableCell>
                      <TableCell><Badge variant="outline">{movie.type || 'N/A'}</Badge></TableCell>
                      <TableCell><Badge variant={movie.status === 'Active' ? 'default' : 'secondary'}>{movie.status || 'N/A'}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenFormDialog(movie)} className="mr-2">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={() => setMovieToDelete(movie)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                          {movieToDelete && movieToDelete._id === movie._id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the movie
                                  "{movieToDelete.title}" and remove its data from servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setMovieToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMovie(movieToDelete)}>
                                  Yes, delete movie
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No movies available. Add one to get started!</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{editingMovie ? `Edit: ${editingMovie.title}` : 'Add New Movie'}</DialogTitle>
          </DialogHeader>
          <MovieForm
            initialData={editingMovie}
            onSubmit={handleSaveMovie}
            onCancel={handleCloseFormDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
