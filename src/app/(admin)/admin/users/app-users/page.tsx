
"use client";

import * as React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { Users, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usersApi } from '@/lib/api';
import type { IUser } from '@/lib/models/User';
import UserForm from '@/components/admin/forms/UserForm';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


export default function ManageAppUsersPage() {
  const [users, setUsers] = React.useState<IUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<IUser | null>(null);
  const [recordToDelete, setRecordToDelete] = React.useState<IUser | null>(null);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error fetching users",
        description: "Could not fetch user list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (record?: IUser) => {
    setEditingRecord(record || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleSaveRecord = async (data: Partial<IUser>) => {
    try {
      if (editingRecord?._id) {
        await usersApi.update(editingRecord._id, data);
        toast({ title: "User Updated", description: `User ${data.username} has been updated.` });
      } else {
        await usersApi.create(data);
        toast({ title: "User Added", description: `User ${data.username} has been added.` });
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Could not save the user.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const record = users.find(r => r._id === recordId);
    if (!record) return;

    try {
        await usersApi.delete(recordId);
        toast({ title: "User Deleted", description: `User ${record.username} has been deleted.`, variant: "destructive" });
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

  return (
    <TooltipProvider>
      <div>
        <PageHeader 
          title="App Users Management" 
          description="View, edit, or remove application users." 
          icon={Users}
          action={
            <Button onClick={() => handleOpenDialog()} size="sm" disabled={isLoading}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add User
            </Button>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeaderComponent>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Monthly XP</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deactivation Reason</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeaderComponent>
                  <TableBody>
                    {users.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">{record.username}</TableCell>
                        <TableCell>{record.email}</TableCell>
                        <TableCell>{record.monthlyXP || 0}</TableCell>
                        <TableCell>{record.lastLogin ? new Date(record.lastLogin).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell><Badge variant={record.status === 'Active' ? 'default' : 'secondary'}>{record.status}</Badge></TableCell>
                        <TableCell>
                          {record.deactivationReason ? (
                              <Tooltip>
                                  <TooltipTrigger>
                                      <span className="truncate max-w-[150px] inline-block underline decoration-dashed cursor-help">
                                          {record.deactivationReason}
                                      </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                      <p>{record.deactivationReason}</p>
                                  </TooltipContent>
                              </Tooltip>
                          ) : (
                              <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
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
                                    This action will permanently delete the user {recordToDelete.username}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setRecordToDelete(null)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRecord(recordToDelete!._id!)}>
                                    Yes, delete user
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
              <p className="text-muted-foreground text-center py-4">No users found. Add one to get started!</p>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRecord ? `Edit ${editingRecord.username}` : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <UserForm
              initialData={editingRecord}
              onSubmit={handleSaveRecord}
              onCancel={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
