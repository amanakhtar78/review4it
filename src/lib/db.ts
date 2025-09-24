
import mongoose, { Mongoose } from 'mongoose';
import logger from './logger';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// This prevents us from creating a new connection on every request in development with hot-reloading.
// In production, this will only be created once.
let cached = (global as any).mongoose as MongooseCache;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    logger.info('Using cached database connection.');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    logger.info('Creating new database connection.');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      logger.info('Database connection established.');
      return mongoose;
    }).catch(err => {
      logger.error(`Database connection failed: ${err}`);
      // Clear the promise so the next attempt can try again.
      cached.promise = null; 
      throw err; // re-throw the error to be caught by the caller
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection fails, clear the promise to allow for a retry.
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;
