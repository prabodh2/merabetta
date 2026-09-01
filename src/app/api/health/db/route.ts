import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(
      {
        status: "unconfigured",
        message: "MONGODB_URI environment variable is not defined in .env.local",
      },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    // Ping the admin database to verify connectivity
    const pingResult = await client.db().admin().ping();

    return NextResponse.json({
      status: "connected",
      message: "Successfully connected to MongoDB Atlas!",
      ping: pingResult,
    });
  } catch (error: any) {
    console.error("MongoDB Atlas connection error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to MongoDB Atlas.",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
