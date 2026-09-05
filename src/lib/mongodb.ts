// import { MongoClient, MongoClientOptions } from "mongodb";

// const uri = process.env.MONGODB_URI;
// const options: MongoClientOptions = {};

// let clientPromise: Promise<MongoClient>;

// declare global {
//   // eslint-disable-next-line no-var
//   var _mongoClientPromise: Promise<MongoClient> | undefined;
// }

// if (!uri) {
//   // Provide a deferred promise rejection so importing this module won't throw at build time
//   clientPromise = Promise.reject(
//     new Error("Invalid/Missing environment variable: 'MONGODB_URI'. Please set it in .env.local")
//   );
//   clientPromise.catch(() => {});
// } else if (process.env.NODE_ENV === "development") {
//   // In development mode, use a global variable so that the value
//   // is preserved across module reloads caused by HMR.
//   if (!global._mongoClientPromise) {
//     const client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   // In production mode, avoid using a global variable.
//   const client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// /**
//  * Helper function to retrieve database connection cleanly
//  */
// export async function getDatabase(dbName?: string) {
//   const client = await clientPromise;
//   return client.db(dbName);
// }

// export default clientPromise;


import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;

const options: MongoClientOptions = {
  // Connection pooling
  maxPoolSize: 20,
  minPoolSize: 5,

  // Retry temporary failures
  retryWrites: true,
  retryReads: true,

  // Read from the primary replica-set member
  readPreference: "primary",

  // Connection reliability
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,

  // Prevent requests from waiting indefinitely for a pool connection
  waitQueueTimeoutMS: 5000
};

let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  clientPromise = Promise.reject(
    new Error(
      "Invalid/Missing environment variable: 'MONGODB_URI'. Please set it in .env.local"
    )
  );

  clientPromise.catch(() => {});
} else if (process.env.NODE_ENV === "development") {
  // Reuse the connection during Next.js development/HMR
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }

  clientPromise = global._mongoClientPromise;
} else {
  // Production connection
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Helper function to retrieve database connection cleanly
 */
export async function getDatabase(dbName?: string) {
  const client = await clientPromise;
  return client.db(dbName);
}

export default clientPromise;