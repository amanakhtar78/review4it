
"use client";

import * as React from 'react';
import { format } from 'date-fns';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PlusCircle, Puzzle, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { quizApi } from '@/lib/api';
import QuizForm, { QuizFormData } from '@/components/admin/forms/QuizForm';
import type { IQuiz } from '@/lib/models/QuizQuestion';

export default function QuizManagementPage() {
  const [quizzes, setQuizzes] = React.useState<IQuiz[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingQuiz, setEditingQuiz] = React.useState<IQuiz | null>(null);
  const [quizToDelete, setQuizToDelete] = React.useState<IQuiz | null>(null);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await quizApi.getAll();
      setQuizzes(data);
    } catch (error) {
      toast({
        title: "Error fetching quizzes",
        description: "Could not fetch quiz list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (quiz?: IQuiz) => {
    setEditingQuiz(quiz || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingQuiz(null);
    setIsDialogOpen(false);
  };

  const handleSaveQuiz = async (data: QuizFormData) => {
    try {
      if (editingQuiz?._id) {
        await quizApi.update(editingQuiz._id, data);
        toast({ title: "Quiz Updated", description: `Quiz for ${format(data.date, 'PPP')} has been updated.` });
      } else {
        await quizApi.create(data);
        toast({ title: "Quiz Added", description: `Quiz for ${format(data.date, 'PPP')} has been added.` });
      }
      handleCloseDialog();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Could not save the quiz.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const record = quizzes.find(q => q._id === quizId);
    if (!record) return;

    try {
      await quizApi.delete(quizId);
      toast({ title: "Quiz Deleted", description: `Quiz for ${format(new Date(record.date), 'PPP')} has been deleted.`, variant: "destructive" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: error.message || "Could not delete the quiz.",
        variant: "destructive"
      });
    } finally {
      setQuizToDelete(null);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Quiz Management" 
        description="Create, edit, and manage daily quizzes." 
        icon={Puzzle}
        action={
          <Button onClick={() => handleOpenDialog()} size="sm" disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Quiz
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Existing Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : quizzes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz._id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{format(new Date(quiz.date), 'PPP')}</TableCell>
                      <TableCell>{quiz.questions.length}</TableCell>
                      <TableCell><Badge variant={quiz.status === 'Active' ? 'default' : 'secondary'}>{quiz.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(quiz)} className="mr-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setQuizToDelete(quiz)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          {quizToDelete && quizToDelete._id === quiz._id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action will permanently delete the quiz "{quizToDelete.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setQuizToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteQuiz(quizToDelete!._id!)}>
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
             <p className="text-muted-foreground text-center py-8">
              No quizzes have been created yet. Click "Add New Quiz" to start.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? `Edit Quiz` : 'Add New Quiz'}</DialogTitle>
          </DialogHeader>
          <QuizForm 
            initialData={editingQuiz}
            onSubmit={handleSaveQuiz}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
