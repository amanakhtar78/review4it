
import type { Movie } from '@/types';
import MovieClientPage from '@/components/movies/MovieClientPage';
import dbConnect from '@/lib/db';
import MovieSeries from '@/lib/models/MovieSeries';

export async function generateStaticParams() {
  await dbConnect();
  const movies = await MovieSeries.find({ status: 'Active' }).limit(20).select('_id').lean();
  
  return movies.map((movie) => ({ 
    id: movie._id.toString(),
  }));
}

interface MovieDetailPageProps {
  params: { id: string };
}

async function getMovie(id: string): Promise<Movie | null> {
    try {
        await dbConnect();
        const movie = await MovieSeries.findById(id).lean();
        if (!movie) return null;
        
        // Convert the lean object to a plain object and serialize it
        const plainMovie = JSON.parse(JSON.stringify(movie));
        return plainMovie as Movie;

    } catch (error) {
        console.error("Failed to fetch movie:", error);
        return null;
    }
}


export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const movie = await getMovie(params.id);

  if (!movie) {
    return <div className="text-center py-10">Movie not found.</div>;
  }

  return <MovieClientPage movie={movie} />;
}
