
"use client";

import * as React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { TrendingUp, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { topActorEarningsApi, castMasterApi, movieSeriesApi } from '@/lib/api'; 
import type { ITopActorEarning } from '@/lib/models/TopActorEarning';
import type { ICastMaster } from '@/lib/models/CastMaster';
import type { IMovieSeries } from '@/lib/models/MovieSeries';
import ActorPaymentForm from '@/components/admin/forms/ActorPaymentForm';

export default function ActorPaymentsPage() {
  const [payments, setPayments] = React.useState<ITopActorEarning[]>([]);
  const [castMembers, setCastMembers] = React.useState<ICastMaster[]>([]);
  const [movies, setMovies] = React.useState<IMovieSeries[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<ITopActorEarning | null>(null);
  const [recordToDelete, setRecordToDelete] = React.useState<ITopActorEarning | null>(null);
  const { toast } = useToast();

  const actorNameMap = React.useMemo(() => {
    return new Map(castMembers.map(actor => [actor._id, actor.castName]));
  }, [castMembers]);
  
  const movieNameMap = React.useMemo(() => {
    return new Map(movies.map(movie => [movie._id, movie.title]));
  }, [movies]);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [paymentsData, castData, moviesData] = await Promise.all([
        topActorEarningsApi.getAll(),
        castMasterApi.getAll(),
        movieSeriesApi.getAll(),
      ]);
      setPayments(paymentsData);
      setCastMembers(castData);
      setMovies(moviesData);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: "Could not fetch payments, cast, or movies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (record?: ITopActorEarning) => {
    setEditingRecord(record || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleSaveRecord = async (data: Partial<ITopActorEarning>) => {
    try {
      if (editingRecord?._id) {
        await topActorEarningsApi.update(editingRecord._id, data);
        toast({ title: "Payment Updated", description: `Payment record has been updated.` });
      } else {
        await topActorEarningsApi.create(data as ITopActorEarning);
        toast({ title: "Payment Added", description: `New payment record has been added.` });
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Could not save the payment record.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const record = payments.find(r => r._id === recordId);
    if (!record) return;

    try {
        await topActorEarningsApi.delete(recordId);
        toast({ title: "Payment Deleted", description: `Payment record has been deleted.`, variant: "destructive" });
        fetchData();
    } catch (error: any) {
        toast({
            title: "Delete Error",
            description: error.message || "Could not delete the record.",
            variant: "destructive"
        });
    } finally {
        setRecordToDelete(null);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  }

  return (
    <div>
      <PageHeader 
        title="Actor Payments" 
        description="Record and manage payments made to actors for specific movies." 
        icon={TrendingUp}
        action={
          <Button onClick={() => handleOpenDialog()} size="sm" disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Payment
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Actor Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Movie</TableHead>
                    <TableHead>Actor Name</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {payments.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{movieNameMap.get(record.movieId) || record.movieId}</TableCell>
                      <TableCell className="font-medium">{actorNameMap.get(record.actorId) || record.actorId}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(record.payment)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(record)} className="mr-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={() => setRecordToDelete(record)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                          {recordToDelete && recordToDelete._id === record._id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the payment record for actor {actorNameMap.get(recordToDelete.actorId) || 'Unknown'} in movie {movieNameMap.get(recordToDelete.movieId) || 'Unknown'}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteRecord(recordToDelete!._id!)}>
                                  Yes, delete
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
            <p className="text-muted-foreground text-center py-4">No actor payment records found. Add one to get started!</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecord ? `Edit Payment` : 'Add New Actor Payment'}</DialogTitle>
          </DialogHeader>
           <ActorPaymentForm
              initialData={editingRecord}
              onSubmit={handleSaveRecord}
              onCancel={handleCloseDialog}
              actors={castMembers}
              movies={movies}
           />
        </DialogContent>
      </Dialog>
    </div>
  );
}
