import clientPromise from "./mongodb";

async function testMigrationPipeline() {
  const client = await clientPromise;
  const db = client.db("merabetta");

  const referenceId = "MB-OAH-410864";

  try {
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
      }
    ];

    const result = await db
      .collection("old age home registration")
      .aggregate(pipeline)
      .toArray();

    console.log(
      "Aggregation result:"
    );

    console.log(
      JSON.stringify(result, null, 2)
    );

  } finally {
    await client.close();
  }
}

testMigrationPipeline();