import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referenceId, flatData, fullData } = body;

    if (!referenceId && !fullData) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: missing form data" },
        { status: 400 }
      );
    }

    // Connect to database (uses 'merabetta' database)
    const db = await getDatabase("merabetta");
    const collection = db.collection("old age home registration");

    const documentToInsert = {
      referenceId: referenceId || `MB-OAH-${Math.floor(100000 + Math.random() * 900000)}`,
      flatData: flatData || null,
      fullData: fullData || body,
      submittedAt: new Date(),
      status: "submitted",
    };

    const result = await collection.insertOne(documentToInsert);

    return NextResponse.json({
      success: true,
      message: "Form data successfully saved to MongoDB Atlas!",
      insertedId: result.insertedId,
      referenceId: documentToInsert.referenceId,
    });
  } catch (error: any) {
    console.error("Error inserting enrollment into MongoDB Atlas:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to save enrollment data to MongoDB Atlas",
      },
      { status: 500 }
    );
  }
}
