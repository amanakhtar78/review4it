
"use client";

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { FunFactAdmin } from '@/types';
import { processedMockMovies } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const funFactSchema = z.object({
  movieId: z.coerce.number().min(1, "Movie ID is required"),
  fact: z.string().min(10, "Fact must be at least 10 characters long"),
  source: z.string().min(3, "Source is required and must be at least 3 characters"),
  created_by: z.coerce.number().min(1, "Creator ID is required"),
  created_at: z.date({ required_error: "Creation date is required." }),
});

type FunFactFormData = z.infer<typeof funFactSchema>;

interface FunFactFormProps {
  initialData?: FunFactAdmin | null;
  onSubmit: (data: FunFactAdmin) => void;
  onCancel: () => void;
}

export default function FunFactForm({ initialData, onSubmit, onCancel }: FunFactFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset, setValue } = useForm<FunFactFormData>({
    resolver: zodResolver(funFactSchema),
    defaultValues: initialData ? {
      ...initialData,
      created_at: new Date(initialData.created_at)
    } : {
      movieId: undefined,
      fact: '',
      source: '',
      created_by: undefined,
      created_at: new Date(),
    },
  });
  
  React.useEffect(() => {
    if (initialData) {
        reset({
        ...initialData,
        created_at: new Date(initialData.created_at),
      });
    } else {
      reset({
        movieId: undefined,
        fact: '',
        source: '',
        created_by: undefined,
        created_at: new Date(),
      });
    }
  }, [initialData, reset]);


  const processSubmit = (data: FunFactFormData) => {
    onSubmit({
      ...data,
      id: initialData?.id || '', // ID is handled by parent
      created_at: format(data.created_at, 'yyyy-MM-dd'), // Format date to string
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6 py-4">
      <div>
        <Label htmlFor="movieId">Movie</Label>
        <Controller
            name="movieId"
            control={control}
            render={({ field }) => (
                <Select
                onValueChange={(value) => setValue("movieId", Number(value))}
                defaultValue={field.value ? String(field.value) : undefined}
                >
                <SelectTrigger id="movieId">
                    <SelectValue placeholder="Select a movie" />
                </SelectTrigger>
                <SelectContent>
                    {processedMockMovies.map(movie => (
                    <SelectItem key={movie.id} value={movie.id}>
                        {movie.movie_title} (ID: {movie.id})
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            )}
        />
        {errors.movieId && <p className="text-sm text-destructive mt-1">{errors.movieId.message}</p>}
      </div>

      <div>
        <Label htmlFor="fact">Fact</Label>
        <Textarea id="fact" {...register('fact')} placeholder="Enter the fun fact" rows={4} />
        {errors.fact && <p className="text-sm text-destructive mt-1">{errors.fact.message}</p>}
      </div>

      <div>
        <Label htmlFor="source">Source</Label>
        <Input id="source" {...register('source')} placeholder="E.g., Director's Interview, DVD Commentary" />
        {errors.source && <p className="text-sm text-destructive mt-1">{errors.source.message}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
            <Label htmlFor="created_by">Created By (User ID)</Label>
            <Input id="created_by" type="number" {...register('created_by')} placeholder="Enter User ID" />
            {errors.created_by && <p className="text-sm text-destructive mt-1">{errors.created_by.message}</p>}
        </div>
        <div>
          <Label htmlFor="created_at">Created At</Label>
            <Controller
                name="created_at"
                control={control}
                render={({ field }) => (
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                )}
            />
            {errors.created_at && <p className="text-sm text-destructive mt-1">{errors.created_at.message}</p>}
        </div>
      </div>


      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Save Changes' : 'Add Fact'}</Button>
      </div>
    </form>
  );
}

    