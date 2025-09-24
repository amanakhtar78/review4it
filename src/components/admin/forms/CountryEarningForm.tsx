
"use client";

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IEarningByCountry } from '@/lib/models/EarningByCountry';
import type { IMovieSeries } from '@/lib/models/MovieSeries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { countries } from '@/data/countries';


const formSchema = z.object({
  movieId: z.string().min(1, "Movie is required"),
  countryId: z.string().min(1, "Country ID is required"),
  payment: z.coerce.number().min(0, "Payment must be a positive number"),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

type FormData = z.infer<typeof formSchema>;

interface CountryEarningFormProps {
  initialData?: IEarningByCountry | null;
  onSubmit: (data: Partial<IEarningByCountry>) => void;
  onCancel: () => void;
  movies: IMovieSeries[];
}

export default function CountryEarningForm({ initialData, onSubmit, onCancel, movies }: CountryEarningFormProps) {
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
    } : {
      movieId: '',
      countryId: '',
      payment: 0,
      status: 'Active',
    },
  });
  
  React.useEffect(() => {
     if (initialData) {
        setValue('movieId', initialData.movieId);
        setValue('countryId', initialData.countryId);
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
        <Label htmlFor="countryId">Country</Label>
        <Controller
          name="countryId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="countryId">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-64">
                    {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                    </SelectItem>
                    ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          )}
        />
        {errors.countryId && <p className="text-sm text-destructive mt-1">{errors.countryId.message}</p>}
      </div>


      <div className="space-y-2">
        <Label htmlFor="payment">Earnings</Label>
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
        <Button type="submit">{initialData ? 'Save Changes' : 'Add Record'}</Button>
      </div>
    </form>
  );
}
