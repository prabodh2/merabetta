import { NextRequest, NextResponse } from "next/server";
import { migrateRegistrationToVendor } from "@/lib/vendorMigration";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { referenceId, approvedBy } = body;

    if (!referenceId || !approvedBy) {
      return NextResponse.json(
        {
          success: false,
          message: "referenceId and approvedBy are required"
        },
        { status: 400 }
      );
    }

    const result = await migrateRegistrationToVendor(
      referenceId,
      approvedBy
    );

    return NextResponse.json(result, {
      status: 200
    });

  } catch (error) {
    console.error("Migration API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Vendor migration failed"
      },
      { status: 500 }
    );
  }
}