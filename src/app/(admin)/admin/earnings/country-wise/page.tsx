"use client";

import * as React from "react";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader as TableHeaderComponent,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BarChart3, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { countryEarningsApi, movieSeriesApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { IEarningByCountry } from "@/lib/models/EarningByCountry";
import type { IMovieSeries } from "@/lib/models/MovieSeries";
import CountryEarningForm from "@/components/admin/forms/CountryEarningForm";
import { countries } from "@/data/countries";

// Add movieTitle to the type, which will come from the API aggregation
type EarningWithMovieTitle = IEarningByCountry & { movieTitle?: string };

export default function CountryWiseEarningsPage() {
  const [earnings, setEarnings] = React.useState<EarningWithMovieTitle[]>([]);
  const [movies, setMovies] = React.useState<IMovieSeries[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] =
    React.useState<EarningWithMovieTitle | null>(null);
  const [recordToDelete, setRecordToDelete] =
    React.useState<EarningWithMovieTitle | null>(null);
  const { toast } = useToast();

  const movieNameMap = React.useMemo(() => {
    return new Map(movies.map((movie) => [movie._id, movie.title]));
  }, [movies]);

  const countryNameMap = React.useMemo(() => {
    return new Map(countries.map((country) => [country.code, country.name]));
  }, []);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [earningsData, moviesData] = await Promise.all([
        countryEarningsApi.getAll(),
        movieSeriesApi.getAll(),
      ]);
      setEarnings(earningsData);
      setMovies(moviesData);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description:
          "Could not fetch country earnings or movies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (record?: EarningWithMovieTitle) => {
    setEditingRecord(record || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleSaveRecord = async (data: Partial<IEarningByCountry>) => {
    try {
      if (editingRecord?._id) {
        await countryEarningsApi.update(editingRecord._id, data);
        toast({
          title: "Earning Updated",
          description: `Country earning record has been updated.`,
        });
      } else {
        await countryEarningsApi.create(data);
        toast({
          title: "Earning Added",
          description: `New country earning record has been added.`,
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Could not save the record.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const record = earnings.find((r) => r._id === recordId);
    if (!record) return;

    try {
      await countryEarningsApi.delete(recordId);
      toast({
        title: "Earning Deleted",
        description: `Country earning record has been deleted.`,
        variant: "destructive",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: error.message || "Could not delete the record.",
        variant: "destructive",
      });
    } finally {
      setRecordToDelete(null);
    }
  };

  const formatCurrency = (amount: unknown) => {
    const n = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div>
      <PageHeader
        title="Country-wise Earnings"
        description="Manage earnings data for movies by country."
        icon={BarChart3}
        action={
          <Button
            onClick={() => handleOpenDialog()}
            size="sm"
            disabled={isLoading}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Country Earning
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Country Earnings List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : earnings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Movie</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {earnings.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">
                        {movieNameMap.get(record.movieId.toString()) ||
                          record.movieTitle ||
                          record.movieId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {countryNameMap.get(record.countryId) ||
                          record.countryId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(record.payment)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(record)}
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRecordToDelete(record)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          {recordToDelete &&
                            recordToDelete._id === record._id && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the earnings
                                    record for movie{" "}
                                    {movieNameMap.get(
                                      recordToDelete.movieId.toString()
                                    ) || "Unknown"}{" "}
                                    in country{" "}
                                    {countryNameMap.get(
                                      recordToDelete.countryId
                                    ) || "Unknown"}
                                    .
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setRecordToDelete(null)}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteRecord(recordToDelete!._id!)
                                    }
                                  >
                                    Yes, delete record
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
            <p className="text-muted-foreground text-center py-4">
              No country earnings records available. Add one to get started!
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRecord
                ? `Edit Earning Record`
                : "Add New Country Earning"}
            </DialogTitle>
          </DialogHeader>
          <CountryEarningForm
            initialData={editingRecord}
            onSubmit={handleSaveRecord}
            onCancel={handleCloseDialog}
            movies={movies}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
