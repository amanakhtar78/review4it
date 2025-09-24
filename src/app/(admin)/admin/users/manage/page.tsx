
"use client";

import * as React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { UserCog, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { adminsApi } from '@/lib/api';
import type { IAdmin } from '@/lib/models/Admin';
import AdminForm from '@/components/admin/forms/AdminForm';


export default function ManageAdminUsersPage() {
  const [admins, setAdmins] = React.useState<IAdmin[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<IAdmin | null>(null);
  const [recordToDelete, setRecordToDelete] = React.useState<IAdmin | null>(null);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminsApi.getAll();
      setAdmins(data);
    } catch (error) {
      toast({
        title: "Error fetching admins",
        description: "Could not fetch admin list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (record?: IAdmin) => {
    setEditingRecord(record || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingRecord(null);
    setIsDialogOpen(false);
  };

  const handleSaveRecord = async (data: Partial<IAdmin>) => {
    try {
      if (editingRecord?._id) {
        await adminsApi.update(editingRecord._id, data);
        toast({ title: "Admin Updated", description: `Admin ${data.username} has been updated.` });
      } else {
        await adminsApi.create(data);
        toast({ title: "Admin Added", description: `Admin ${data.username} has been added.` });
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Could not save the admin.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const record = admins.find(r => r._id === recordId);
    if (!record) return;

    try {
        await adminsApi.delete(recordId);
        toast({ title: "Admin Deleted", description: `Admin ${record.username} has been deleted.`, variant: "destructive" });
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
    <div>
      <PageHeader 
        title="Admin Users Management" 
        description="Add, edit, or remove admin users." 
        icon={UserCog}
        action={
          <Button onClick={() => handleOpenDialog()} size="sm" disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Admin
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Admin User List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : admins.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeaderComponent>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rights</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeaderComponent>
                <TableBody>
                  {admins.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.username}</TableCell>
                      <TableCell>{record.email}</TableCell>
                      <TableCell><Badge variant="outline">{record.rights.join(', ')}</Badge></TableCell>
                      <TableCell><Badge variant={record.status === 'Active' ? 'default' : 'secondary'}>{record.status}</Badge></TableCell>
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
                                  This action will permanently delete the admin user {recordToDelete.username}.
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
            <p className="text-muted-foreground text-center py-4">No admin users found. Add one to get started!</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRecord ? `Edit ${editingRecord.username}` : 'Add New Admin User'}</DialogTitle>
          </DialogHeader>
          <AdminForm
            initialData={editingRecord}
            onSubmit={handleSaveRecord}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
