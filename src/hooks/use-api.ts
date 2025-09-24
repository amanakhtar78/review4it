
"use client";

import * as React from 'react';
import { useToast } from './use-toast';

interface UseApiOptions<T> {
  fetcher: () => Promise<T[]>;
  create?: (data: Omit<T, 'id' | '_id'>) => Promise<T>;
  update?: (id: string, data: Partial<T>) => Promise<T>;
  remove?: (id: string) => Promise<void>;
  initialData?: T[];
}

export function useApi<T extends { id?: string; _id?: string }>({
  fetcher,
  create,
  update,
  remove,
  initialData = [],
}: UseApiOptions<T>) {
  const [data, setData] = React.useState<T[]>(initialData);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createItem = async (itemData: Omit<T, 'id' | '_id'>) => {
    if (!create) throw new Error("Create function not provided");
    try {
      const newItem = await create(itemData);
      setData(prev => [newItem, ...prev]);
      toast({ title: 'Success', description: 'Item created successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create item.', variant: 'destructive' });
      throw err; // re-throw to be caught in component
    }
  };

  const updateItem = async (id: string, itemData: Partial<T>) => {
    if (!update) throw new Error("Update function not provided");
    try {
      const updatedItem = await update(id, itemData);
      setData(prev => prev.map(item => (item._id === id ? updatedItem : item)));
      toast({ title: 'Success', description: 'Item updated successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update item.', variant: 'destructive' });
       throw err;
    }
  };

  const removeItem = async (id: string) => {
    if (!remove) throw new Error("Remove function not provided");
    try {
      await remove(id);
      setData(prev => prev.filter(item => item._id !== id));
      toast({ title: 'Success', description: 'Item deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete item.', variant: 'destructive' });
      throw err;
    }
  };

  return {
    data,
    isLoading,
    error,
    fetchData,
    createItem,
    updateItem,
    removeItem,
  };
}
