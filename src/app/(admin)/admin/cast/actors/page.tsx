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
import { ListOrdered, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { castMasterApi } from "@/lib/api";
import type { ICastMaster } from "@/lib/models/CastMaster";
import CastMasterForm from "@/components/admin/forms/CastMasterForm";

export default function ActorsListPage() {
  const [cast, setCast] = React.useState<ICastMaster[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<ICastMaster | null>(
    null
  );
  const [recordToDelete, setRecordToDelete] =
    React.useState<ICastMaster | null>(null);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await castMasterApi.getAll();
      setCast(data);
    } catch (error) {
      toast({
        title: "Error fetching cast",
        description: "Could not fetch cast list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (record?: ICastMaster) => {
    setEditingRecord(record || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleSaveRecord = async (data: Partial<ICastMaster>) => {
    try {
      if (editingRecord?._id) {
        await castMasterApi.update(editingRecord._id, data);
        toast({
          title: "Cast Member Updated",
          description: `${data.castName} has been updated.`,
        });
      } else {
        await castMasterApi.create(data);
        toast({
          title: "Cast Member Added",
          description: `${data.castName} has been added.`,
        });
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Could not save the cast member.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const record = cast.find((r) => r._id === recordId);
    if (!record) return;

    try {
      await castMasterApi.delete(recordId);
      toast({
        title: "Cast Member Deleted",
        description: `${record.castName} has been deleted.`,
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

  return (
    <div>
      <PageHeader
        title="Actors / Cast Master"
        description="Manage the global list of cast and crew members."
        icon={ListOrdered}
        action={
          <Button
            onClick={() => handleOpenDialog()}
            size="sm"
            disabled={isLoading}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Cast Member
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Cast & Crew List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : cast.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {cast.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>
                        {record.imageUrl ? (
                          <img
                            src={record.imageUrl}
                            alt={record.castName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-avatar.png";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              No Image
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.castName}
                      </TableCell>
                      <TableCell>{record.castType}</TableCell>
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
                                    This action will permanently delete{" "}
                                    {recordToDelete.castName}.
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
            <p className="text-muted-foreground text-center py-4">
              No cast members found. Add one to get started!
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRecord
                ? `Edit ${editingRecord.castName}`
                : "Add New Cast Member"}
            </DialogTitle>
          </DialogHeader>
          <CastMasterForm
            initialData={editingRecord}
            onSubmit={handleSaveRecord}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
