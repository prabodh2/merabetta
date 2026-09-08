import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";

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

export async function migrateRegistrationToVendor(
  referenceId: string,
  approvedBy: string
) {
  const client = await clientPromise;
  const db = client.db("merabetta");

  const session = client.startSession();

  try {
    const result = await session.withTransaction(async () => {

      // =====================================================
      // 1. AGGREGATION PIPELINE
      // =====================================================

      const pipeline = [
        {
          $match: {
            referenceId,
            status: "submitted"
          }
        },

        {
          $project: {
            _id: 1,
            referenceId: 1,

            vendor_name: {
              $ifNull: [
                "$fullData.contactPersonName",
                "Unknown Vendor"
              ]
            },

            business_name: {
              $ifNull: [
                "$fullData.homeName",
                "Unknown Old Age Home"
              ]
            },

            phone: {
              $ifNull: [
                "$fullData.mobileNumber",
                ""
              ]
            },

            email: {
              $ifNull: [
                "$fullData.emailAddress",
                ""
              ]
            },

            address: {
              $ifNull: [
                "$fullData.address",
                ""
              ]
            },

            city: {
              $ifNull: [
                "$fullData.city",
                ""
              ]
            },

            state: {
              $ifNull: [
                "$fullData.state",
                ""
              ]
            },

            pinCode: {
              $ifNull: [
                "$fullData.pinCode",
                ""
              ]
            }
          }
        },

        {
          $limit: 1
        }
      ];

      const registration = await db
        .collection<RegistrationForMigration>(
          "old age home registration"
        )
        .aggregate<RegistrationForMigration>(
          pipeline,
          { session }
        )
        .next();

      // =====================================================
      // 2. CHECK REGISTRATION
      // =====================================================

      if (!registration) {
        throw new Error(
          "Registration not found or already processed"
        );
      }

      // =====================================================
      // 3. GET COUNTER
      // =====================================================

      const countersCollection =
        db.collection<Counter>("counters");

      // =====================================================
      // 4. INCREMENT COUNTER ATOMICALLY
      // =====================================================

      const counter =
        await countersCollection.findOneAndUpdate(
          {
            _id: "vendor"
          },
          {
            $inc: {
              sequence_value: 1
            }
          },
          {
            returnDocument: "after",
            session
          }
        );

      if (!counter) {
        throw new Error(
          "Vendor counter not found"
        );
      }

      // =====================================================
      // 5. GENERATE VENDOR ID
      // =====================================================

      const vendorId =
        `MB-VENDOR-${counter.sequence_value
          .toString()
          .padStart(4, "0")}`;

      const now = new Date();

      // =====================================================
      // 6. CREATE VENDOR DOCUMENT
      // =====================================================

      const vendorDocument = {
        user_id: vendorId,

        vendor_name:
          registration.vendor_name,

        business_name:
          registration.business_name,

        phone:
          registration.phone,

        email:
          registration.email,

        is_verified: false,

        approval_status: "approved",

        approved_at: now,

        approved_by: approvedBy,

        role: "vendor",

        is_active: true,

        registration_id:
          registration._id,

        registration_reference:
          registration.referenceId,

        location: {
          address:
            registration.address,

          city:
            registration.city,

          state:
            registration.state,

          pinCode:
            registration.pinCode
        },

        services: [],

        created_at: now,

        updated_at: now
      };

      // =====================================================
      // 7. INSERT VENDOR
      // =====================================================

      await db
        .collection("vendor")
        .insertOne(
          vendorDocument,
          { session }
        );

      // =====================================================
      // 8. UPDATE REGISTRATION STATUS
      // =====================================================

      const updateResult =
        await db
          .collection("old age home registration")
          .updateOne(
            {
              _id: registration._id,
              status: "submitted"
            },
            {
              $set: {
                status: "approved",
                approvedAt: now,
                approvedBy,
                updatedAt: now
              }
            },
            { session }
          );

      if (updateResult.modifiedCount !== 1) {
        throw new Error(
          "Registration status could not be updated"
        );
      }

      // =====================================================
      // 9. CREATE AUDIT LOG
      // =====================================================

      await db
        .collection("audit_log")
        .insertOne(
          {
            action: "approve",

            admin_id: approvedBy,

            vendor_id: vendorId,

            timestamp: now,

            details: {
              registration_reference:
                registration.referenceId,

              registration_id:
                registration._id.toString(),

              message:
                "Vendor approved and migrated successfully"
            }
          },
          { session }
        );

      // =====================================================
      // 10. RETURN RESULT
      // =====================================================

      return {
        vendorId,
        registrationId:
          registration._id,
        referenceId:
          registration.referenceId
      };
    });

    // =======================================================
    // TRANSACTION COMMITTED
    // =======================================================

    return {
      success: true,

      message:
        "Registration migrated to vendor successfully",

      data: result
    };

  } catch (error) {

    console.error(
      "Vendor migration transaction failed:",
      error
    );

    throw error;

  } finally {

    await session.endSession();
  }
}