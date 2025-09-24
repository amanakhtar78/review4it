
"use client";

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ITopActorEarning } from '@/lib/models/TopActorEarning';
import type { ICastMaster } from '@/lib/models/CastMaster';
import type { IMovieSeries } from '@/lib/models/MovieSeries';

const formSchema = z.object({
  movieId: z.string().min(1, "Movie must be selected"),
  actorId: z.string().min(1, "Actor must be selected"),
  payment: z.coerce.number().min(0, "Payment must be a positive number"),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

type FormData = z.infer<typeof formSchema>;

interface ActorPaymentFormProps {
  initialData?: ITopActorEarning | null;
  onSubmit: (data: Partial<ITopActorEarning>) => void;
  onCancel: () => void;
  actors: ICastMaster[];
  movies: IMovieSeries[];
}

export default function ActorPaymentForm({ initialData, onSubmit, onCancel, actors, movies }: ActorPaymentFormProps) {
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
    } : {
      movieId: '',
      actorId: '',
      payment: 0,
      status: 'Active',
    },
  });
  
  React.useEffect(() => {
    if (initialData) {
        setValue('movieId', initialData.movieId);
        setValue('actorId', initialData.actorId);
        setValue('payment', initialData.payment);
        setValue('status', initialData.status);
    }
  }, [initialData, setValue]);

  const processSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="movieId">Movie</Label>
        <Controller
          name="movieId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="movieId">
                <SelectValue placeholder="Select a movie" />
              </SelectTrigger>
              <SelectContent>
                {movies.map((movie) => (
                  <SelectItem key={movie._id} value={movie._id!}>
                    {movie.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.movieId && <p className="text-sm text-destructive mt-1">{errors.movieId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="actorId">Actor</Label>
        <Controller
          name="actorId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="actorId">
                <SelectValue placeholder="Select an actor" />
              </SelectTrigger>
              <SelectContent>
                {actors.map((actor) => (
                  <SelectItem key={actor._id} value={actor._id!}>
                    {actor.castName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.actorId && <p className="text-sm text-destructive mt-1">{errors.actorId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment">Payment</Label>
        <Input id="payment" type="number" {...register('payment')} />
        {errors.payment && <p className="text-sm text-destructive mt-1">{errors.payment.message}</p>}
      </div>

       <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select onValueChange={(value) => setValue('status', value as 'Active' | 'Inactive')} defaultValue={watch('status')}>
            <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
        </Select>
        {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Save Changes' : 'Add Payment'}</Button>
      </div>
    </form>
  );
}
