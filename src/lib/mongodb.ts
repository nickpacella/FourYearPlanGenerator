// src/lib/mongodb.ts

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const options = {};

// Ensure the MONGODB_URI is defined
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable in your .env.local');
}

// Prevent multiple instances of MongoClient in development
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the client is cached
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's fine to just create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
