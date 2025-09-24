import type { IMovieSeries as IMovieSeriesFromModel } from '@/lib/models/MovieSeries';

// This is the base interface from the model
export interface IMovieSeries extends IMovieSeriesFromModel {}


// This is a new type, not from the original schema, but useful for frontend components
export interface Rating {
  source: string;
  value: string;
}

export type SuccessLevel = 'Blockbuster' | 'Hit' | 'Average' | 'Flop' | 'Disaster';

// These types are based on the DB design and are used in frontend components
export interface Actor {
  id: string;
  name: string;
  imageUrl: string;
  characterName?: string;
  earnings?: number;
}

export interface Song {
  id: string;
  title: string;
  singer: string;
  imageUrl: string;
  releaseDate: string; // ISO Date
  earnings: number;
  views: number;
  streams: number;
}

export interface NewsItem {
  id: string;
  title: string;
  snippet: string;
  imageUrl?: string;
  dataAiHint?: string;
  link: string;
}

export interface DailyEarning {
  day: number;
  amount: number;
  name?: string; // For table display
}

export interface WeeklyEarning {
  week: number;
  name: string; // e.g., "Week 1"
  amount: number;
}

export interface MonthlyEarning {
  month: number;
  name: string; // e.g., "Month 1"
  amount: number;
}

export interface CountryEarning {
  country: string;
  amount: number;
  fill?: string; // Optional fill color for chart
}

export interface FunFact {
  title: string;
  description: string;
  image?: string;
  source?: string;
  sourceLink?: string;
}

export interface Soundtrack {
  image?: string;
  title: string;
  releaseDate?: string; // ISODate
  sungBy: string;
  streamTimes?: number;
  videoPlayedViews?: number;
  earned?: number;
}

// Represents the structure of the `movies` collection document.
// Used for both API communication and frontend data handling.
export interface Movie extends IMovieSeries {
  // ---- Properties below are for frontend processing, not direct DB fields ----
  // These are being phased out in favor of the direct properties above
  id?: string; // Mock data might have this
  roi?: number; // Calculated field for Return on Investment
  image_1?: string;
  image_2?: string;
  image_3?: string;
  movie_title?: string; // Back-compat, prefer `title`
  movie_description?: string; // Back-compat, prefer `description`
  movie_categories?: string[]; // Back-compat, prefer `category`
  trailer_ytube?: string; // Back-compat, prefer `trailerLink`
  teaser_ytube?: string; // Back-compat, prefer `teaserLink`
  rating_imdb?: string; // Back-compat, prefer `ratings.imdb`
  rating_google?: string; // Back-compat, prefer `ratings.google`
  rating_rotten_tomatoes?: string; // Back-compat, prefer `ratings.rottenTomato`

  // These are derived/processed on the frontend
  actors?: Actor[];
  songs?: any[];
  isUpcoming?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  dataAiHint?: string;
  countryWiseEarnings?: CountryEarning[];
  dailyEarnings?: DailyEarning[];
  weeklyEarnings?: WeeklyEarning[];
  monthlyEarnings?: MonthlyEarning[];
  movie_zone?: string;
  movie_type?: string;
  created_by?: number;
  created_at?: string;
}

// Admin specific types based on schema
export interface FunFactAdmin {
  _id?: string;
  id: string;
  movieId: number;
  fact: string;
  source: string;
  created_by: number;
  created_at: string;
}

export interface HotNews {
  _id?: string;
  id: string;
  movieId: number;
  news: string;
  source: string;
  image_url: string;
  created_by: number;
  created_at: string;
}

export interface EarningDayRecord {
  _id?: string;
  id: string; // BIGINT from schema, string for frontend
  movieId: number; // INTEGER
  day_1: number; // SMALLINT
  day_2: number;
  day_3: number;
  day_4: number;
  day_5: number;
  day_6: number;
  day_7: number;
  day_8: number;
  day_9: number;
  day_10: number;
  day_11: number;
  day_12: number;
  day_13: number;
  day_14: number;
  week_1: number; // SMALLINT
  week_2: number;
  week_3: number;
  week_4: number;
  week_5: number;
  week_6: number;
  week_7: number;
  month_1: number; // SMALLINT
  month_2: number;
  month_3: number;
  month_4: number;
  created_by: number; // INTEGER
  created_at: string; // DATE string
}

export interface CountryEarningAdminRecord {
  _id?: string; // From MongoDB
  movieId: string; // From MongoDB ref
  country: string;
  amount: number;
  created_by: string; // From JWT payload
  created_at: string; // ISO Date String
}
