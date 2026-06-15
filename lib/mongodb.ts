// MongoDB connection helper (official Next.js pattern).
//
// A single MongoClient is shared across the app. In development we cache it on
// globalThis so Next.js hot-reloads don't open a new connection pool each time.
// Reads the connection string from DATABASE_URL (falls back to MONGODB_URI).

import { MongoClient, type Db } from "mongodb";

const uri = process.env.DATABASE_URL ?? process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB ?? "ds_visualizer";

if (!uri) {
  throw new Error(
    "Missing MongoDB connection string. Set DATABASE_URL (or MONGODB_URI) in .env",
  );
}

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

const client = new MongoClient(uri);

// Reuse the promise in dev; create fresh in prod.
const clientPromise: Promise<MongoClient> =
  globalForMongo._mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClientPromise = clientPromise;
}

export default clientPromise;

/** Convenience accessor for the app database. */
export async function getDb(): Promise<Db> {
  const c = await clientPromise;
  return c.db(DB_NAME);
}
