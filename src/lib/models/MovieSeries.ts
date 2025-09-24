import mongoose, { Schema, Document, models, Model } from "mongoose";

export interface IMovieSeries extends Document {
  name: string;
  title: string;
  description: string;
  category: string[];
  trailerLink?: string;
  teaserLink?: string;
  type: string;
  ratings: {
    imdb: number;
    google: number;
    rottenTomato: number;
    review4All: number;
  };
  streamingInfo?: string;
  movieReleaseDate: string;
  ottReleaseDate?: string;
  ottExpectedReleaseDate?: string;
  ottStreamingAt?: string;
  excitementLevel: number;
  performanceMeter: string;
  budget: number;
  earnings: number;
  ticketPrice: string;
  criticsScore: number;
  audienceScore: number;
  boxOfficeScore: number;
  socialBuzz?: string;
  boxOfficeTrends: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
    monthly: Record<string, number>;
  };
  funFacts: Array<{
    title: string;
    description: string;
    image?: string;
    source?: string;
    sourceLink?: string;
  }>;
  RelatedNews: Array<{
    title: string;
    description: string;
    image?: string;
    source?: string;
    sourceLink?: string;
  }>;
  soundtracks: Array<{
    image?: string;
    title: string;
    releaseDate: string;
    sungBy: string;
    streamTimes: number;
    videoPlayedViews: number;
    earned: number;
  }>;
  status: "Active" | "Inactive" | "Upcoming";
  origin?: string;
  languagesAvailable?: string[];
  bannerHorizontal?: string;
  bannerVertical?: string;
  movieDuration?: string;
  webseriesEpisodeCount?: number;
  webseriesInfo?: Array<{
    title: string;
    duration: string;
  }>;
  likes: number;
  saves: number;
  dislikes: number;
  adultOverview?: Record<string, { count: number; description?: string }>;
}

const MovieSeriesSchema: Schema<IMovieSeries> = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: [String], required: true },
    trailerLink: { type: String },
    teaserLink: { type: String },
    type: { type: String, required: true },
    ratings: {
      imdb: { type: Number },
      google: { type: Number },
      rottenTomato: { type: Number },
      review4All: { type: Number },
    },
    streamingInfo: { type: String },
    movieReleaseDate: { type: String },
    ottReleaseDate: { type: String },
    ottExpectedReleaseDate: { type: String },
    ottStreamingAt: { type: String },
    excitementLevel: { type: Number },
    performanceMeter: { type: String },
    budget: { type: Number },
    earnings: { type: Number },
    ticketPrice: { type: String },
    criticsScore: { type: Number },
    audienceScore: { type: Number },
    boxOfficeScore: { type: Number },
    socialBuzz: { type: String },
    boxOfficeTrends: {
      daily: { type: Schema.Types.Mixed, default: {} },
      weekly: { type: Schema.Types.Mixed, default: {} },
      monthly: { type: Schema.Types.Mixed, default: {} },
    },
    funFacts: [
      {
        title: { type: String },
        description: { type: String },
        image: { type: String },
        source: { type: String },
        sourceLink: { type: String },
      },
    ],
    RelatedNews: [
      {
        title: { type: String },
        description: { type: String },
        image: { type: String },
        source: { type: String },
        sourceLink: { type: String },
      },
    ],
    soundtracks: [
      {
        image: { type: String },
        title: { type: String },
        releaseDate: { type: String },
        sungBy: { type: String },
        streamTimes: { type: Number },
        videoPlayedViews: { type: Number },
        earned: { type: Number },
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Inactive", "Upcoming"],
      default: "Active",
    },
    origin: { type: String },
    languagesAvailable: { type: [String] },
    bannerHorizontal: { type: String },
    bannerVertical: { type: String },
    movieDuration: { type: String },
    webseriesEpisodeCount: { type: Number },
    webseriesInfo: [
      {
        title: { type: String },
        duration: { type: String },
      },
    ],
    likes: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    adultOverview: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: "createdDate", updatedAt: "updatedDate" },
  }
);

// Add an index to the movieReleaseDate for faster querying of upcoming movies
MovieSeriesSchema.index({ movieReleaseDate: 1 });
MovieSeriesSchema.index({ type: 1, status: 1, movieReleaseDate: 1 });

const MovieSeries: Model<IMovieSeries> =
  models.MovieSeries ||
  mongoose.model<IMovieSeries>("MovieSeries", MovieSeriesSchema, "movieSeries");

export default MovieSeries;
