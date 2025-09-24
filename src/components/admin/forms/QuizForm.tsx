
"use client";

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PlusCircle, Trash2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IQuiz, IQuizQuestion, IOption } from '@/lib/models/QuizQuestion';
import { ScrollArea } from '@/components/ui/scroll-area';

const optionSchema = z.object({
    text: z.string().optional(),
    imageUrl: z.string().optional(),
});

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.enum(['mcq', 'mcqWithImage', 'true_false']),
  options: z.array(optionSchema).min(2, "At least two options are required"),
  correctAnswer: z.coerce.number().min(0, "Correct answer must be selected"),
  image: z.string().url().optional().or(z.literal('')),
});

const quizSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  date: z.date({ required_error: "A date for the quiz is required." }),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  category: z.enum(['Bollywood', 'Hollywood', 'Tollywood', 'General']).default('General'),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

export type QuizFormData = z.infer<typeof quizSchema>;

interface QuizFormProps {
  initialData?: IQuiz | null;
  onSubmit: (data: QuizFormData) => void;
  onCancel: () => void;
}

export default function QuizForm({ initialData, onSubmit, onCancel }: QuizFormProps) {
  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: initialData ? {
      ...initialData,
      date: new Date(initialData.date),
    } : {
      title: '',
      date: new Date(),
      status: 'Active',
      category: 'General',
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });
  
  const watchedQuestions = watch('questions');

  const addQuestion = () => {
    append({
      questionText: '',
      questionType: 'mcq',
      options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
      correctAnswer: 0,
      image: '',
    });
  };

  const processSubmit = (data: QuizFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <ScrollArea className="h-[70vh] pr-4">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input id="title" {...register('title')} placeholder="e.g., Daily Movie Trivia" />
                    {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Quiz Date</Label>
                    <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        )}
                    />
                     {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
                </div>
                <div>
                    <Label htmlFor="category">Category</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="Bollywood">Bollywood</SelectItem>
                                    <SelectItem value="Hollywood">Hollywood</SelectItem>
                                    <SelectItem value="Tollywood">Tollywood</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Questions</CardTitle>
              <Button type="button" size="sm" onClick={addQuestion}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => {
                const questionType = watchedQuestions[index]?.questionType;

                return (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <h4 className="font-semibold">Question {index + 1}</h4>
                    
                    <div className="space-y-2">
                        <Label>Question Text</Label>
                        <Textarea {...register(`questions.${index}.questionText`)} placeholder="What movie is this from?" />
                        {errors.questions?.[index]?.questionText && <p className="text-sm text-destructive mt-1">{errors.questions[index].questionText.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Question Image URL</Label>
                        <Input {...register(`questions.${index}.image`)} placeholder="https://example.com/image.jpg" />
                        {errors.questions?.[index]?.image && <p className="text-sm text-destructive mt-1">{errors.questions[index].image.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Question Type</Label>
                        <Controller
                            name={`questions.${index}.questionType`}
                            control={control}
                            render={({ field }) => (
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    // Reset options when type changes
                                    const newOptions = value === 'true_false' 
                                      ? [{ text: 'True' }, { text: 'False' }]
                                      : [{ text: '' }, { text: '' }, { text: '' }, { text: '' }];
                                    setValue(`questions.${index}.options`, newOptions);
                                  }} 
                                  defaultValue={field.value}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mcq">MCQ (Text Options)</SelectItem>
                                        <SelectItem value="mcqWithImage">MCQ (Image Options)</SelectItem>
                                        <SelectItem value="true_false">True/False</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Options & Correct Answer</Label>
                      <div className="space-y-2">
                        {watchedQuestions[index]?.options.map((_, optionIndex) => {
                           const isTrueFalse = questionType === 'true_false';
                           return (
                            <div key={optionIndex} className="flex items-center gap-2">
                                <Controller
                                    name={`questions.${index}.correctAnswer`}
                                    control={control}
                                    render={({ field }) => (
                                        <input 
                                            type="radio" 
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                            value={optionIndex}
                                            checked={field.value === optionIndex}
                                            className="form-radio h-4 w-4 text-primary focus:ring-primary"
                                        />
                                    )}
                                />
                                {questionType === 'mcqWithImage' ? (
                                    <Input {...register(`questions.${index}.options.${optionIndex}.imageUrl`)} placeholder={`Image URL for Option ${optionIndex + 1}`} />
                                ) : (
                                    <Input {...register(`questions.${index}.options.${optionIndex}.text`)} placeholder={`Option ${optionIndex + 1}`} disabled={isTrueFalse} />
                                )}
                            </div>
                           );
                        })}
                      </div>
                      {errors.questions?.[index]?.options && <p className="text-sm text-destructive mt-1">{errors.questions[index].options.message}</p>}
                    </div>

                  </div>
                );
              })}
              {fields.length === 0 && <p className="text-muted-foreground text-center py-4">No questions added yet.</p>}
               {errors.questions && <p className="text-sm text-destructive mt-1">{errors.questions.message}</p>}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
      <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Save Changes' : 'Create Quiz'}</Button>
      </div>
    </form>
  );
}
