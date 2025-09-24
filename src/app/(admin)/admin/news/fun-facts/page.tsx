
"use client";

import * as React from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader as TableHeaderComponent, TableRow } from '@/components/ui/table';
import { ListOrdered, PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { FunFactAdmin } from '@/types';
import { mockFunFacts as initialFunFacts, processedMockMovies } from '@/data/mockData';
import FunFactForm from '@/components/admin/forms/FunFactForm';
import { useToast } from "@/hooks/use-toast";

export default function FunFactsPage() {
  const [funFacts, setFunFacts] = React.useState<FunFactAdmin[]>(initialFunFacts);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingFact, setEditingFact] = React.useState<FunFactAdmin | null>(null);
  const { toast } = useToast();

  const handleOpenDialog = (fact?: FunFactAdmin) => {
    setEditingFact(fact || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingFact(null);
    setIsDialogOpen(false);
  };

  const handleSaveFact = (data: FunFactAdmin) => {
    if (editingFact) {
      setFunFacts(funFacts.map(f => f.id === editingFact.id ? { ...f, ...data, id: editingFact.id } : f));
      toast({ title: "Fun Fact Updated", description: "The fun fact has been successfully updated." });
    } else {
      const newFact = { ...data, id: `ff${funFacts.length + 1}-${Date.now()}` }; // Simple ID generation
      setFunFacts([...funFacts, newFact]);
      toast({ title: "Fun Fact Added", description: "The new fun fact has been successfully added." });
    }
    handleCloseDialog();
  };

  const handleDeleteFact = (factId: string) => {
    // Add confirmation dialog here in a real app
    setFunFacts(funFacts.filter(f => f.id !== factId));
    toast({ title: "Fun Fact Deleted", description: "The fun fact has been deleted.", variant: "destructive" });
  };
  
  const getMovieTitle = (movieId: number) => {
    const movie = processedMockMovies.find(m => m.id === String(movieId));
    return movie ? movie.movie_title : `Unknown Movie (ID: ${movieId})`;
  };

  return (
    <div>
      <PageHeader 
        title="Fun Facts Management" 
        description="Add, edit, or delete fun facts about movies." 
        icon={ListOrdered}
        action={
          <Button onClick={() => handleOpenDialog()} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Fun Fact
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Fun Facts List</CardTitle>
        </CardHeader>
        <CardContent>
          {funFacts.length > 0 ? (
            <Table>
              <TableHeaderComponent>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Movie</TableHead>
                  <TableHead className="w-[40%]">Fact</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeaderComponent>
              <TableBody>
                {funFacts.map((fact) => (
                  <TableRow key={fact.id}>
                    <TableCell className="font-medium">{fact.id}</TableCell>
                    <TableCell>{getMovieTitle(fact.movieId)}</TableCell>
                    <TableCell className="truncate max-w-xs">{fact.fact}</TableCell>
                    <TableCell>{fact.source}</TableCell>
                    <TableCell>{fact.created_by}</TableCell>
                    <TableCell>{new Date(fact.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(fact)} className="mr-2">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFact(fact.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No fun facts available. Add one to get started!</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFact ? 'Edit Fun Fact' : 'Add New Fun Fact'}</DialogTitle>
          </DialogHeader>
          <FunFactForm
            initialData={editingFact}
            onSubmit={handleSaveFact}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

    
