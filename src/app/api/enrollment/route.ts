import { NextResponse } from "next/server";
import { saveEnrollment } from "@/lib/enrollmentStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referenceId, flatData, fullData } = body;

    const dataToSave = fullData || body;

    if (!dataToSave || typeof dataToSave !== 'object') {
      return NextResponse.json(
        { success: false, error: "Invalid payload: missing form data" },
        { status: 400 }
      );
    }

    const result = await saveEnrollment({
      referenceId,
      flatData,
      fullData: dataToSave,
    });

    return NextResponse.json({
      success: true,
      message: "Form data successfully saved to MongoDB Atlas!",
      insertedId: result.insertedId,
      referenceId: result.referenceId,
    });
  } catch (error: unknown) {
    console.error("Error inserting enrollment:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save enrollment data";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
