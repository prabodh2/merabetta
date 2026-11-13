import { ClientSession, Db, ObjectId } from "mongodb";
import clientPromise from "./mongodb";

const DB_NAME = process.env.MONGODB_DB || "merabetta";
const COLLECTION_NAME =
  process.env.MONGODB_COLLECTION || "old age home registration";

interface Counter {
  _id: string;
  sequence_value: number;
}

interface RegistrationForMigration {
  _id: ObjectId;
  referenceId: string;

  vendor_name: string;
  business_name: string;
  phone: string;
  email: string;

  address: string;
  city: string;
  state: string;
  pinCode: string;
}

async function runMigrationSteps(
  db: Db,
  idOrRef: string,
  approvedBy: string,
  session?: ClientSession
) {
  const sessionOpts = session ? { session } : {};

  // Match by referenceId OR _id, and allow 'submitted' or 'approved'
  const matchCondition: Record<string, unknown> = ObjectId.isValid(idOrRef)
    ? {
        $or: [{ _id: new ObjectId(idOrRef) }, { referenceId: idOrRef }],
        status: { $in: ["submitted", "approved"] }
      }
    : {
        referenceId: idOrRef,
        status: { $in: ["submitted", "approved"] }
      };

  // =====================================================
  // 1. AGGREGATION PIPELINE
  // =====================================================

  const pipeline = [
    {
      $match: matchCondition
    },

    {
      $project: {
        _id: 1,
        referenceId: {
          $ifNull: ["$referenceId", ""]
        },

        vendor_name: {
          $ifNull: [
            "$fullData.contactPersonName",
            { $ifNull: ["$contactPersonName", "Unknown Vendor"] }
          ]
        },

        business_name: {
          $ifNull: [
            "$fullData.homeName",
            { $ifNull: ["$homeName", "Unknown Old Age Home"] }
          ]
        },

        phone: {
          $ifNull: [
            "$fullData.mobileNumber",
            { $ifNull: ["$mobileNumber", ""] }
          ]
        },

        email: {
          $ifNull: [
            "$fullData.emailAddress",
            { $ifNull: ["$emailAddress", ""] }
          ]
        },

        address: {
          $ifNull: [
            "$fullData.address",
            { $ifNull: ["$address", ""] }
          ]
        },

        city: {
          $ifNull: [
            "$fullData.city",
            { $ifNull: ["$city", ""] }
          ]
        },

        state: {
          $ifNull: [
            "$fullData.state",
            { $ifNull: ["$state", ""] }
          ]
        },

        pinCode: {
          $ifNull: [
            "$fullData.pinCode",
            { $ifNull: ["$pinCode", ""] }
          ]
        }
      }
    },

    {
      $limit: 1
    }
  ];

  const registration = await db
    .collection<RegistrationForMigration>(COLLECTION_NAME)
    .aggregate<RegistrationForMigration>(pipeline, sessionOpts)
    .next();

  // =====================================================
  // 2. CHECK REGISTRATION
  // =====================================================

  if (!registration) {
    throw new Error("Registration not found or already processed");
  }

  const resolvedRefId =
    registration.referenceId ||
    `MB-OAH-${registration._id.toString().slice(-6)}`;
  const now = new Date();

  // =====================================================
  // 3. CHECK IF VENDOR ALREADY EXISTS (IDEMPOTENT)
  // =====================================================

  const existingVendor = await db.collection("vendor").findOne(
    {
      $or: [
        { registration_id: registration._id },
        { registration_reference: resolvedRefId }
      ]
    },
    sessionOpts
  );

  let vendorId: string;

  if (existingVendor) {
    vendorId = existingVendor.user_id || existingVendor._id.toString();

    await db.collection("vendor").updateOne(
      { _id: existingVendor._id },
      {
        $set: {
          vendor_name: registration.vendor_name,
          business_name: registration.business_name,
          phone: registration.phone,
          email: registration.email,
          approval_status: "approved",
          approved_at: now,
          approved_by: approvedBy,
          is_active: true,
          location: {
            address: registration.address,
            city: registration.city,
            state: registration.state,
            pinCode: registration.pinCode
          },
          updated_at: now
        }
      },
      sessionOpts
    );
  } else {
    // =====================================================
    // 4. INCREMENT COUNTER ATOMICALLY (WITH UPSERT)
    // =====================================================

    const countersCollection = db.collection<Counter>("counters");

    const counter = await countersCollection.findOneAndUpdate(
      { _id: "vendor" },
      { $inc: { sequence_value: 1 } },
      {
        returnDocument: "after",
        upsert: true,
        ...sessionOpts
      }
    );

    const seqVal = counter?.sequence_value ?? 1;

    // =====================================================
    // 5. GENERATE VENDOR ID
    // =====================================================

    vendorId = `MB-VENDOR-${seqVal.toString().padStart(4, "0")}`;

    // =====================================================
    // 6. CREATE & INSERT VENDOR DOCUMENT
    // =====================================================

    const vendorDocument = {
      user_id: vendorId,
      vendor_name: registration.vendor_name,
      business_name: registration.business_name,
      phone: registration.phone,
      email: registration.email,
      is_verified: true,
      approval_status: "approved",
      approved_at: now,
      approved_by: approvedBy,
      role: "vendor",
      is_active: true,
      registration_id: registration._id,
      registration_reference: resolvedRefId,
      location: {
        address: registration.address,
        city: registration.city,
        state: registration.state,
        pinCode: registration.pinCode
      },
      services: [],
      created_at: now,
      updated_at: now
    };

    await db.collection("vendor").insertOne(vendorDocument, sessionOpts);
  }

  // =====================================================
  // 8. UPDATE REGISTRATION STATUS
  // =====================================================

  await db.collection(COLLECTION_NAME).updateOne(
    { _id: registration._id },
    {
      $set: {
        status: "approved",
        approvedAt: now,
        approvedBy,
        reviewedAt: now.toISOString(),
        reviewedBy: approvedBy,
        updatedAt: now
      }
    },
    sessionOpts
  );

  // =====================================================
  // 9. CREATE AUDIT LOG
  // =====================================================

  await db.collection("audit_log").insertOne(
    {
      action: "approve",
      admin_id: approvedBy,
      vendor_id: vendorId,
      timestamp: now,
      details: {
        registration_reference: resolvedRefId,
        registration_id: registration._id.toString(),
        message: "Vendor approved and migrated successfully"
      }
    },
    sessionOpts
  );

  // =====================================================
  // 10. RETURN RESULT
  // =====================================================

  return {
    vendorId,
    registrationId: registration._id,
    referenceId: resolvedRefId
  };
}

export async function migrateRegistrationToVendor(
  referenceId: string,
  approvedBy: string
) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const session = client.startSession();

  try {
    let result: Awaited<ReturnType<typeof runMigrationSteps>> | undefined;

    try {
      await session.withTransaction(async () => {
        result = await runMigrationSteps(db, referenceId, approvedBy, session);
      });
    } catch (txError: unknown) {
      const msg = txError instanceof Error ? txError.message : String(txError);
      // Fallback for standalone MongoDB instances that don't support replica-set transactions
      if (
        msg.includes("Transaction numbers are only allowed") ||
        msg.includes("transactions are not supported")
      ) {
        result = await runMigrationSteps(db, referenceId, approvedBy);
      } else {
        throw txError;
      }
    }

    return {
      success: true,
      message: "Registration migrated to vendor successfully",
      data: result
    };
  } catch (error) {
    console.error("Vendor migration failed:", error);
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function handleRegistrationRejection(
  idOrRef: string,
  rejectedBy: string,
  reason?: string
) {
  if (!process.env.MONGODB_URI) return;

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const now = new Date();

    const query: Record<string, unknown> = ObjectId.isValid(idOrRef)
      ? { $or: [{ _id: new ObjectId(idOrRef) }, { referenceId: idOrRef }] }
      : { referenceId: idOrRef };

    const reg = await db.collection(COLLECTION_NAME).findOne(query);
    if (!reg) return;

    const resolvedRef =
      reg.referenceId || `MB-OAH-${reg._id.toString().slice(-6)}`;

    const existingVendor = await db.collection("vendor").findOne({
      $or: [
        { registration_id: reg._id },
        { registration_reference: resolvedRef }
      ]
    });

    if (existingVendor) {
      await db.collection("vendor").updateOne(
        { _id: existingVendor._id },
        {
          $set: {
            approval_status: "rejected",
            is_active: false,
            updated_at: now
          }
        }
      );
    }

    await db.collection("audit_log").insertOne({
      action: "reject",
      admin_id: rejectedBy,
      vendor_id: existingVendor?.user_id || resolvedRef,
      timestamp: now,
      details: {
        registration_reference: resolvedRef,
        registration_id: reg._id.toString(),
        reason: reason || "",
        message: "Registration rejected by admin"
      }
    });
  } catch (err) {
    console.warn("[handleRegistrationRejection] Failed to log rejection:", err);
  }
}