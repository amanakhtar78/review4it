"use client";

import * as React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, PlusCircle, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Movie } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const movieJson = {
  id: "M001",
  name: "The Last Horizon",
  title: "The Last Horizon",
  description:
    "An epic sci-fi adventure about humanity’s survival on a new planet.",
  category: ["Action", "Adventure", "Sci-Fi"],
  languagesAvailable: ["English", "French"],
  origin: "USA",
  trailerLink: "https://youtube.com/trailer123",
  teaserLink: "https://youtube.com/teaser123",
  movieDuration: "148 min",
  type: "Movie",
  ratings: {
    imdb: 8.5,
    google: 92,
    rottenTomato: 88,
    review4All: 4.3,
  },
  streamingInfo: "Available in 4K HDR",
  movieReleaseDate: "2025-05-20",
  ottReleaseDate: "2025-07-15",
  ottExpectedReleaseDate: "2025-07-10",
  ottStreamingAt: "Netflix",
  excitementLevel: 95,
  performanceMeter: "High",
  budget: 200000000,
  earnings: 950000000,
  ticketPrice: "$15 - $45",
  criticsScore: 85,
  audienceScore: 90,
  boxOfficeScore: 88,
  socialBuzz: "Trending Worldwide",
  boxOfficeTrends: {
    daily: { day1: 12000000, day2: 15000000, day14: 2500000 },
    weekly: { week1: 55000000, week2: 30000000, week6: 5000000 },
    monthly: {
      month1: 100000000,
      month2: 75000000,
      month3: 40000000,
      month4: 15000000,
    },
  },
  funFacts: [
    {
      title: "Record-Breaking Opening",
      description:
        "The movie made history with the highest opening weekend in 2025.",
      image: "https://imageurl.com/news1.jpg",
      source: "Variety",
      sourceLink: "https://variety.com/movie-news1",
    },
    {
      title: "Behind the Scenes",
      description: "Shot entirely on location in Iceland.",
      image: "https://imageurl.com/news2.jpg",
      source: "Hollywood Reporter",
      sourceLink: "https://hollywoodreporter.com/news2",
    },
  ],
  RelatedNews: [
    {
      title: "Record-Breaking Opening",
      description:
        "The movie made history with the highest opening weekend in 2025.",
      image: "https://imageurl.com/news1.jpg",
      source: "Variety",
      sourceLink: "https://variety.com/movie-news1",
    },
    {
      title: "Behind the Scenes",
      description: "Shot entirely on location in Iceland.",
      image: "https://imageurl.com/news2.jpg",
      source: "Hollywood Reporter",
      sourceLink: "https://hollywoodreporter.com/news2",
    },
  ],
  soundtracks: [
    {
      image: "https://imageurl.com/sound1.jpg",
      title: "Echoes of Tomorrow",
      releaseDate: "2025-05-01",
      sungBy: "John Legend",
      streamTimes: 20000000,
      videoPlayedViews: 15000000,
      earned: 1000000,
    },
    {
      image: "https://imageurl.com/sound2.jpg",
      title: "Rise Beyond",
      releaseDate: "2025-05-10",
      sungBy: "Adele",
      streamTimes: 35000000,
      videoPlayedViews: 25000000,
      earned: 2000000,
    },
  ],
  status: "Active",
  createdDate: "2025-08-27T18:30:00Z",
  updatedDate: "2025-08-27T18:30:00Z",
};
const trendSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.coerce.number({ invalid_type_error: "Must be a number" }),
});

const episodeSchema = z.object({
  title: z.string().min(1, "Episode title is required"),
  duration: z.string().min(1, "Episode duration is required"),
});

// Zod schema based on the new detailed movie structure
const movieFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.array(z.string()).optional(),
  category_input: z.string().optional(),
  trailerLink: z.string().url().optional().or(z.literal("")),
  teaserLink: z.string().url().optional().or(z.literal("")),
  type: z.string().optional(),
  origin: z.string().optional(),
  languagesAvailable: z.array(z.string()).optional(),
  languages_input: z.string().optional(),
  bannerHorizontal: z.string().url().optional().or(z.literal("")),
  bannerVertical: z.string().url().optional().or(z.literal("")),
  movieDuration: z.string().optional(),
  webseriesEpisodeCount: z.coerce.number().optional(),
  webseriesInfo: z.array(episodeSchema).optional(),
  ratings: z
    .object({
      imdb: z.coerce.number().optional(),
      google: z.coerce.number().optional(),
      rottenTomato: z.coerce.number().optional(),
      review4All: z.coerce.number().optional(),
    })
    .optional(),
  streamingInfo: z.string().optional(),
  movieReleaseDate: z.date().optional(),
  ottReleaseDate: z.date().optional(),
  ottExpectedReleaseDate: z.date().optional(),
  ottStreamingAt: z.string().optional(),
  excitementLevel: z.coerce.number().optional(),
  performanceMeter: z.string().optional(),
  budget: z.coerce.number().optional(),
  earnings: z.coerce.number().optional(),
  ticketPrice: z.string().optional(),
  criticsScore: z.coerce.number().optional(),
  audienceScore: z.coerce.number().optional(),
  boxOfficeScore: z.coerce.number().optional(),
  socialBuzz: z.string().optional(),

  dailyTrends: z.array(trendSchema).optional(),
  weeklyTrends: z.array(trendSchema).optional(),
  monthlyTrends: z.array(trendSchema).optional(),

  relatedNews: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        image: z.string().url().optional().or(z.literal("")),
        source: z.string().optional(),
        sourceLink: z.string().url().optional().or(z.literal("")),
      })
    )
    .optional(),
  funFacts: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        image: z.string().url().optional().or(z.literal("")),
        source: z.string().optional(),
        sourceLink: z.string().optional(),
      })
    )
    .optional(),
  soundtracks: z
    .array(
      z.object({
        image: z.string().url().optional().or(z.literal("")),
        title: z.string().min(1, "Title is required"),
        releaseDate: z.date().optional(),
        sungBy: z.string().min(1, "Singer is required"),
        streamTimes: z.coerce.number().optional(),
        videoPlayedViews: z.coerce.number().optional(),
        earned: z.coerce.number().optional(),
      })
    )
    .optional(),
  adultOverviewEntries: z
    .array(
      z.object({
        key: z.string().min(1, "Parameter is required"),
        count: z.coerce.number().min(0, "Count must be >= 0"),
        description: z.string().optional(),
      })
    )
    .optional(),
  status: z.enum(["Active", "Inactive", "Upcoming"]).default("Active"),
});

export type MovieFormData = z.infer<typeof movieFormSchema>;

// Dropdown options
const dailyOptions = Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`);
const weeklyOptions = Array.from({ length: 8 }, (_, i) => `Week ${i + 1}`);
const monthlyOptions = Array.from({ length: 4 }, (_, i) => `Month ${i + 1}`);

interface MovieFormProps {
  initialData?: Movie | null;
  onSubmit: (data: Movie) => void;
  onCancel: () => void;
}

const formatTrendsForStorage = (
  trends: { name: string; value: number }[] | undefined
) => {
  if (!trends) return {};
  return trends.reduce((acc, item) => {
    acc[item.name.replace(/\s/g, "").toLowerCase()] = item.value;
    return acc;
  }, {} as Record<string, number>);
};

const parseTrendsForForm = (trends: Record<string, number> | undefined) => {
  if (!trends) return [];
  return Object.entries(trends)
    .map(([key, value]) => {
      // Improved regex to handle cases like "day1", "week1", "month1"
      const match = key.match(/([a-zA-Z]+)(\d+)/);
      if (match) {
        const namePart = match[1];
        const numberPart = match[2];
        const formattedName =
          namePart.charAt(0).toUpperCase() +
          namePart.slice(1) +
          " " +
          numberPart;
        return { name: formattedName, value };
      }
      return { name: key, value };
    })
    .sort((a, b) => {
      // Sort to ensure consistent order
      const aNum = parseInt(a.name.split(" ")[1] || "0");
      const bNum = parseInt(b.name.split(" ")[1] || "0");
      return aNum - bNum;
    });
};

const safeParseDate = (dateString?: string): Date | undefined => {
  if (!dateString) return undefined;
  const date = parseISO(dateString);
  return isValid(date) ? date : undefined;
};

const transformMovieDataToFormData = (movie: Partial<Movie>): MovieFormData => {
  const entriesFromAdultOverview =
    movie && (movie as any).adultOverview
      ? Object.entries(
          (movie as any).adultOverview as Record<
            string,
            { count: number; description?: string }
          >
        ).map(([key, value]) => ({
          key,
          count: Number((value as any)?.count ?? 0),
          description: (value as any)?.description || "",
        }))
      : [];
  // Ensure default keys exist
  const ensured = new Map<
    string,
    { key: string; count: number; description?: string }
  >();
  for (const e of entriesFromAdultOverview) ensured.set(e.key, e);
  if (!ensured.has("kissing"))
    ensured.set("kissing", { key: "kissing", count: 0, description: "" });
  if (!ensured.has("nude"))
    ensured.set("nude", { key: "nude", count: 0, description: "" });

  return {
    ...(movie as MovieFormData),
    category_input: movie.category?.join(", "),
    languages_input: movie.languagesAvailable?.join(", "),
    dailyTrends: parseTrendsForForm(movie.boxOfficeTrends?.daily),
    weeklyTrends: parseTrendsForForm(movie.boxOfficeTrends?.weekly),
    monthlyTrends: parseTrendsForForm(movie.boxOfficeTrends?.monthly),
    movieReleaseDate: safeParseDate(movie.movieReleaseDate),
    ottReleaseDate: safeParseDate(movie.ottReleaseDate),
    ottExpectedReleaseDate: safeParseDate(movie.ottExpectedReleaseDate),
    relatedNews: movie.RelatedNews?.map((rn) => ({ ...rn })) || [],
    funFacts:
      movie.funFacts?.map((ff) => ({
        ...ff,
        description: ff.description || (ff as any).fact || "",
      })) || [],
    soundtracks:
      movie.soundtracks?.map((st) => ({
        ...st,
        releaseDate: safeParseDate(st.releaseDate),
      })) || [],
    webseriesInfo: movie.webseriesInfo?.map((wi) => ({ ...wi })) || [],
    adultOverviewEntries: Array.from(ensured.values()),
  };
};

export default function MovieForm({
  initialData,
  onSubmit,
  onCancel,
}: MovieFormProps) {
  const [jsonInput, setJsonInput] = React.useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      status: "Active",
      funFacts: [],
      relatedNews: [],
      soundtracks: [],
      dailyTrends: [],
      weeklyTrends: [],
      monthlyTrends: [],
      webseriesInfo: [],
      adultOverviewEntries: [
        { key: "kissing", count: 0, description: "" },
        { key: "nude", count: 0, description: "" },
      ],
    },
  });

  const {
    fields: dailyTrendFields,
    append: appendDailyTrend,
    remove: removeDailyTrend,
  } = useFieldArray({ control, name: "dailyTrends" });
  const {
    fields: weeklyTrendFields,
    append: appendWeeklyTrend,
    remove: removeWeeklyTrend,
  } = useFieldArray({ control, name: "weeklyTrends" });
  const {
    fields: monthlyTrendFields,
    append: appendMonthlyTrend,
    remove: removeMonthlyTrend,
  } = useFieldArray({ control, name: "monthlyTrends" });
  const {
    fields: relatedNewsFields,
    append: appendRelatedNews,
    remove: removeRelatedNews,
  } = useFieldArray({ control, name: "relatedNews" });
  const {
    fields: funFactFields,
    append: appendFunFact,
    remove: removeFunFact,
  } = useFieldArray({ control, name: "funFacts" });
  const {
    fields: soundtrackFields,
    append: appendSoundtrack,
    remove: removeSoundtrack,
  } = useFieldArray({ control, name: "soundtracks" });
  const {
    fields: webseriesInfoFields,
    append: appendWebseriesInfo,
    remove: removeWebseriesInfo,
  } = useFieldArray({ control, name: "webseriesInfo" });
  const {
    fields: adultOverviewFields,
    append: appendAdultOverview,
    remove: removeAdultOverview,
  } = useFieldArray({ control, name: "adultOverviewEntries" });

  React.useEffect(() => {
    if (initialData) {
      reset(transformMovieDataToFormData(initialData));
    }
  }, [initialData, reset]);

  const loadDataFromJSON = () => {
    try {
      const parsedJson = JSON.parse(jsonInput);
      const data = Array.isArray(parsedJson) ? parsedJson[0] : parsedJson;

      const transformedData = transformMovieDataToFormData(data);
      reset(transformedData);

      toast({
        title: "JSON Loaded",
        description: "Form fields have been populated from the JSON data.",
      });
    } catch (error: any) {
      toast({
        title: "JSON Error",
        description:
          error.message ||
          "Could not parse JSON. Please check the format and content.",
        variant: "destructive",
      });
      console.error("JSON Parsing Error:", error);
    }
  };

  const processSubmit = (data: MovieFormData) => {
    const categories =
      data.category_input
        ?.split(",")
        .map((c) => c.trim())
        .filter(Boolean) || [];

    const languages =
      data.languages_input
        ?.split(",")
        .map((l) => l.trim())
        .filter(Boolean) || [];

    // Build adultOverview object from entries
    const adultOverview = (data.adultOverviewEntries || []).reduce(
      (acc, item) => {
        const key = (item.key || "").trim().toLowerCase();
        if (!key) return acc;
        acc[key] = {
          count: Number(item.count) || 0,
          description: item.description || "",
        };
        return acc;
      },
      {} as Record<string, { count: number; description?: string }>
    );

    const finalMovieData: Movie = {
      ...(initialData || {}),
      ...data,
      origin: data.origin,
      languagesAvailable: languages,
      category: categories,
      boxOfficeTrends: {
        daily: formatTrendsForStorage(data.dailyTrends),
        weekly: formatTrendsForStorage(data.weeklyTrends),
        monthly: formatTrendsForStorage(data.monthlyTrends),
      },
      movieReleaseDate:
        data.movieReleaseDate && isValid(data.movieReleaseDate)
          ? data.movieReleaseDate.toISOString()
          : undefined,
      ottReleaseDate:
        data.ottReleaseDate && isValid(data.ottReleaseDate)
          ? data.ottReleaseDate.toISOString()
          : undefined,
      ottExpectedReleaseDate:
        data.ottExpectedReleaseDate && isValid(data.ottExpectedReleaseDate)
          ? data.ottExpectedReleaseDate.toISOString()
          : undefined,
      soundtracks: data.soundtracks?.map((st) => ({
        ...st,
        releaseDate:
          st.releaseDate && isValid(st.releaseDate)
            ? st.releaseDate.toISOString()
            : undefined,
      })),
      RelatedNews: data.relatedNews,
      adultOverview,
    };

    onSubmit(finalMovieData);
  };
  const copyJsonToClipboard = () => {
    try {
      const jsonString = JSON.stringify(movieJson, null, 2); // Pretty-print
      navigator.clipboard.writeText(jsonString);
      alert("JSON copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy JSON:", err);
      alert("Failed to copy JSON. Check console.");
    }
  };
  const renderTrendSection = (
    title: string,
    fields: any[],
    remove: (index: number) => void,
    append: (obj: { name: string; value: number }) => void,
    fieldName: "dailyTrends" | "weeklyTrends" | "monthlyTrends",
    options: string[]
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button
          type="button"
          size="sm"
          onClick={() => append({ name: "", value: 0 })}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center gap-2 p-2 border rounded-md"
          >
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Controller
                control={control}
                name={`${fieldName}.${index}.name`}
                render={({ field }) => (
                  <div className="space-y-1">
                    <Label className="text-xs">Period</Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
              <div>
                <Label className="text-xs">Value</Label>
                <Input
                  type="number"
                  {...register(`${fieldName}.${index}.value`)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No records added.
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6 py-2">
      <div className="max-h-[75vh] overflow-y-auto pr-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Load from JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              placeholder="Paste movie JSON here..."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={6}
            />
            <Button type="button" onClick={loadDataFromJSON} size="sm">
              <Download className="mr-2 h-4 w-4" /> Load Data
            </Button>
            <Button type="button" onClick={copyJsonToClipboard} size="sm">
              <Download className="mr-2 h-4 w-4" /> Copy Json
            </Button>
          </CardContent>
        </Card>

        {/* Core Details */}
        <Card>
          <CardHeader>
            <CardTitle>Core Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category_input">
                  Categories (comma-separated)
                </Label>
                <Input id="category_input" {...register("category_input")} />
              </div>
              <div>
                <Label htmlFor="languages_input">
                  Languages (comma-separated)
                </Label>
                <Input id="languages_input" {...register("languages_input")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Type (e.g., Movie, Series)</Label>
                <Input id="type" {...register("type")} />
              </div>
              <div>
                <Label htmlFor="trailerLink">Trailer Link</Label>
                <Input id="trailerLink" {...register("trailerLink")} />
                {errors.trailerLink && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.trailerLink.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="teaserLink">Teaser Link</Label>
                <Input id="teaserLink" {...register("teaserLink")} />
                {errors.teaserLink && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.teaserLink.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="origin">Origin Country</Label>
                <Input id="origin" {...register("origin")} />
              </div>
              <div>
                <Label htmlFor="bannerHorizontal">Horizontal Banner URL</Label>
                <Input
                  id="bannerHorizontal"
                  {...register("bannerHorizontal")}
                />
                {errors.bannerHorizontal && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.bannerHorizontal.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="bannerVertical">Vertical Banner URL</Label>
                <Input id="bannerVertical" {...register("bannerVertical")} />
                {errors.bannerVertical && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.bannerVertical.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration & Episode Information */}
        <Card>
          <CardHeader>
            <CardTitle>Duration &amp; Episode Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="movieDuration">Movie Duration</Label>
                <Input
                  id="movieDuration"
                  {...register("movieDuration")}
                  placeholder="e.g., 2h 30m"
                />
              </div>
              <div>
                <Label htmlFor="webseriesEpisodeCount">Episode Count</Label>
                <Input
                  id="webseriesEpisodeCount"
                  type="number"
                  {...register("webseriesEpisodeCount")}
                  placeholder="e.g., 8"
                />
              </div>
            </div>

            {/* Web Series Episodes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Web Series Episodes</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    appendWebseriesInfo({ title: "", duration: "" })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Episode
                </Button>
              </div>
              {webseriesInfoFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-end gap-2 p-2 border rounded-md"
                >
                  <div className="grid grid-cols-2 gap-2 flex-grow">
                    <div>
                      <Label className="text-xs">Episode Title</Label>
                      <Input
                        {...register(`webseriesInfo.${index}.title`)}
                        placeholder={`Episode ${index + 1}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Duration</Label>
                      <Input
                        {...register(`webseriesInfo.${index}.duration`)}
                        placeholder="e.g., 45m"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeWebseriesInfo(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {webseriesInfoFields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No episodes added.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Release Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Movie Release Date</Label>
              <Controller
                name="movieReleaseDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div className="space-y-1">
              <Label>OTT Release Date</Label>
              <Controller
                name="ottReleaseDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div className="space-y-1">
              <Label>OTT Expected Date</Label>
              <Controller
                name="ottExpectedReleaseDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Financials & Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Financials & Performance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Budget</Label>
              <Input type="number" {...register("budget")} />
            </div>
            <div>
              <Label>Earnings</Label>
              <Input type="number" {...register("earnings")} />
            </div>
            <div>
              <Label>Ticket Price</Label>
              <Input {...register("ticketPrice")} placeholder="$10 - $30" />
            </div>
            <div>
              <Label>Excitement Level</Label>
              <Input type="number" {...register("excitementLevel")} />
            </div>
            <div>
              <Label>Performance Meter</Label>
              <Input {...register("performanceMeter")} />
            </div>
            <div>
              <Label>Critics Score</Label>
              <Input type="number" {...register("criticsScore")} />
            </div>
            <div>
              <Label>Audience Score</Label>
              <Input type="number" {...register("audienceScore")} />
            </div>
            <div>
              <Label>Box Office Score</Label>
              <Input type="number" {...register("boxOfficeScore")} />
            </div>
          </CardContent>
        </Card>

        {/* Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>Ratings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>IMDb</Label>
              <Input type="number" step="0.1" {...register("ratings.imdb")} />
            </div>
            <div>
              <Label>Google (%)</Label>
              <Input type="number" {...register("ratings.google")} />
            </div>
            <div>
              <Label>Rotten Tomato (%)</Label>
              <Input type="number" {...register("ratings.rottenTomato")} />
            </div>
            <div>
              <Label>Review4All</Label>
              <Input
                type="number"
                step="0.1"
                {...register("ratings.review4All")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </CardContent>
        </Card>

        {/* Box Office Trends */}
        <div className="space-y-4">
          {renderTrendSection(
            "Daily Trends",
            dailyTrendFields,
            removeDailyTrend,
            appendDailyTrend,
            "dailyTrends",
            dailyOptions
          )}
          {renderTrendSection(
            "Weekly Trends",
            weeklyTrendFields,
            removeWeeklyTrend,
            appendWeeklyTrend,
            "weeklyTrends",
            weeklyOptions
          )}
          {renderTrendSection(
            "Monthly Trends",
            monthlyTrendFields,
            removeMonthlyTrend,
            appendMonthlyTrend,
            "monthlyTrends",
            monthlyOptions
          )}
        </div>

        {/* Related News */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Related News</CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={() => appendRelatedNews({ title: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add News
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {relatedNewsFields.map((field, index) => (
              <div
                key={field.id}
                className="p-3 border rounded-md space-y-2 relative"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeRelatedNews(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Title</Label>
                    <Input {...register(`relatedNews.${index}.title`)} />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input {...register(`relatedNews.${index}.image`)} />
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Input {...register(`relatedNews.${index}.source`)} />
                  </div>
                  <div>
                    <Label>Source Link</Label>
                    <Input {...register(`relatedNews.${index}.sourceLink`)} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    {...register(`relatedNews.${index}.description`)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fun Facts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fun Facts</CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={() => appendFunFact({ title: "", description: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Fact
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {funFactFields.map((field, index) => (
              <div
                key={field.id}
                className="p-3 border rounded-md space-y-2 relative"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeFunFact(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Label>Title</Label>
                    <Input {...register(`funFacts.${index}.title`)} />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input {...register(`funFacts.${index}.image`)} />
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Input {...register(`funFacts.${index}.source`)} />
                  </div>
                  <div>
                    <Label>Source Link</Label>
                    <Input {...register(`funFacts.${index}.sourceLink`)} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    {...register(`funFacts.${index}.description`)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Soundtracks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Soundtracks</CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={() => appendSoundtrack({ title: "", sungBy: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Track
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {soundtrackFields.map((field, index) => (
              <div
                key={field.id}
                className="p-3 border rounded-md space-y-2 relative"
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeSoundtrack(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div>
                    <Label>Title</Label>
                    <Input {...register(`soundtracks.${index}.title`)} />
                  </div>
                  <div>
                    <Label>Sung By</Label>
                    <Input {...register(`soundtracks.${index}.sungBy`)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Release Date</Label>
                    <Controller
                      name={`soundtracks.${index}.releaseDate`}
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value && isValid(field.value)
                                ? format(field.value, "PPP")
                                : "Pick date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input {...register(`soundtracks.${index}.image`)} />
                  </div>
                  <div>
                    <Label>Streams</Label>
                    <Input
                      type="number"
                      {...register(`soundtracks.${index}.streamTimes`)}
                    />
                  </div>
                  <div>
                    <Label>Views</Label>
                    <Input
                      type="number"
                      {...register(`soundtracks.${index}.videoPlayedViews`)}
                    />
                  </div>
                  <div>
                    <Label>Earned</Label>
                    <Input
                      type="number"
                      {...register(`soundtracks.${index}.earned`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Save Changes" : "Add Movie"}
        </Button>
      </div>
    </form>
  );
}
