
import mongoose, { Schema, Document, models, Model } from "mongoose";

// This model is being deprecated in favor of MovieSeries.
// It is kept temporarily to avoid breaking changes but should not be used for new development.

export interface IMovie extends Document {
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
  status: "Active" | "Inactive";
}

const MovieSchema: Schema<IMovie> = new Schema(
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
      daily: { type: Schema.Types.Mixed },
      weekly: { type: Schema.Types.Mixed },
      monthly: { type: Schema.Types.Mixed },
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
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  {
    timestamps: { createdAt: "createdDate", updatedAt: "updatedDate" },
  }
);


const Movie: Model<IMovie> =
  models.Movie || mongoose.model<IMovie>("Movie", MovieSchema, "movies");
export default Movie;
