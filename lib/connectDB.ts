import mongoose from "mongoose";
import { MONGODB_URL, NODE_ENV } from "@/lib/constants/env";

const MONGODB_URI = MONGODB_URL;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Extend global type
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

// Reuse cached connection in development
const cache = (global.mongooseCache ??= {
  conn: null,
  promise: null,
});

export default async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.set("bufferCommands", false);

    cache.promise = mongoose.connect(MONGODB_URI);
  }

  try {
    cache.conn = await cache.promise;

    return cache.conn;
  } catch (error) {
    throw error;
  }
}
