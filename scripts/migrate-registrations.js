const { MongoClient } = require("mongodb");
const fs = require("fs");

function loadMongoUri() {
  const env = fs.readFileSync(".env.local", "utf8");

  const line = env
    .split("\n")
    .find((line) => line.startsWith("MONGODB_URI="));

  if (!line) {
    throw new Error("MONGODB_URI not found in .env.local");
  }

  let uri = line.substring("MONGODB_URI=".length).trim();

  // Remove surrounding quotes if present
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1);
  }

  return uri;
}

const MONGODB_URI = loadMongoUri();

const DB_NAME = "merabetta";
const COLLECTION_NAME = "old age home registration";

function createDefaultFullData() {
  return {
    homeName: "",
    registrationNumber: "",
    yearEstablished: "",
    organizationType: "",
    organizationTypeOther: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    website: "",
    contactPersonName: "",
    designation: "",
    mobileNumber: "",
    emailAddress: "",
    totalCapacity: "",
    currentResidents: "",
    activeResidents: "",
    bedRiddenResidents: "",

    medicalFacilities: {
      doctorVisits: false,
      nursingCare: false,
      emergencyCare: false,
      physiotherapy: false,
      other: false,
      otherDetails: ""
    },

    servicesOffered: {
      assistedLiving: false,
      independentLiving: false,
      dementiaCare: false,
      palliativeCare: false,
      dayCareServices: false,
      meals: false,
      recreationalActivities: false,
      other: false,
      otherDetails: ""
    },

    documents: {
      registrationCertificate: "",
      panCard: "",
      gstCertificate: "",
      addressProof: "",
      representativeIdProof: "",
      bankAccountDetails: "",
      facilityPhotographs: [],
      facilityVideo: "",
      licensesCertificates: []
    },

    commercialAgreed: false,
    declarationAgreed: false,
    submissionDate: ""
  };
}

async function migrate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log("Connected to MongoDB.");
    console.log(`Database: ${DB_NAME}`);
    console.log(`Collection: ${COLLECTION_NAME}`);
    console.log("");

    const documents = await collection.find({}).toArray();

    let updatedCount = 0;
    let fullDataAdded = 0;
    let statusAdded = 0;
    let createdAtAdded = 0;

    for (const document of documents) {
      const updates = {};

      // Add fullData only when it is missing/null
      if (
        document.fullData === undefined ||
        document.fullData === null
      ) {
        updates.fullData = createDefaultFullData();
        fullDataAdded++;
      }

      // Add status only when it is missing/null
      if (
        document.status === undefined ||
        document.status === null
      ) {
        updates.status = "submitted";
        statusAdded++;
      }

      // Add createdAt only when it is missing/null
      if (
        document.createdAt === undefined ||
        document.createdAt === null
      ) {
        updates.createdAt = new Date();
        createdAtAdded++;
      }

      // Only update documents that actually need changes
      if (Object.keys(updates).length > 0) {
        await collection.updateOne(
          { _id: document._id },
          { $set: updates }
        );

        updatedCount++;
      }
    }

    console.log("Migration completed successfully.");
    console.log("");
    console.log(`Documents checked: ${documents.length}`);
    console.log(`Documents updated: ${updatedCount}`);
    console.log(`fullData added: ${fullDataAdded}`);
    console.log(`status added: ${statusAdded}`);
    console.log(`createdAt added: ${createdAtAdded}`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

migrate();