/**
 * MongoDB Index Creation Script
 *
 * Creates recommended indexes for the search system.
 * Run with: npx tsx scripts/createSearchIndexes.ts
 *
 * Indexes are idempotent — running this multiple times is safe.
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'merabetta';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || 'old age home registration';

async function createIndexes() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.log('   Set it in .env.local or export it before running this script');
    process.exit(1);
  }

  console.log('🔗 Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log(`📦 Collection: ${DB_NAME}.${COLLECTION_NAME}\n`);

    // Define indexes with explanations
    const indexes: Array<{
      spec: Record<string, 1 | -1>;
      name: string;
      reason: string;
    }> = [
      {
        spec: { status: 1 },
        name: 'idx_status',
        reason: 'Every search query filters by status=approved',
      },
      {
        spec: { status: 1, 'fullData.city': 1 },
        name: 'idx_status_city',
        reason: 'Most common filter: approved homes in a city',
      },
      {
        spec: { status: 1, 'fullData.pinCode': 1 },
        name: 'idx_status_pincode',
        reason: 'Exact pincode lookups for approved homes',
      },
      {
        spec: { 'fullData.homeName': 1 },
        name: 'idx_homeName',
        reason: 'Home name text search / autocomplete',
      },
      {
        spec: { status: 1, 'fullData.state': 1 },
        name: 'idx_status_state',
        reason: 'State-level filtering for approved homes',
      },
      {
        spec: { status: 1, 'fullData.servicesOffered.assistedLiving': 1 },
        name: 'idx_status_assisted',
        reason: 'Filter by Assisted Living service',
      },
      {
        spec: { status: 1, 'fullData.servicesOffered.palliativeCare': 1 },
        name: 'idx_status_palliative',
        reason: 'Filter by Palliative Care service',
      },
      {
        spec: { status: 1, submittedAt: -1 },
        name: 'idx_status_date',
        reason: 'Sort approved homes by newest first',
      },
      {
        spec: { referenceId: 1 },
        name: 'idx_referenceId',
        reason: 'Unique lookup by reference ID (e.g., MB-OAH-526481)',
      },
    ];

    console.log('📋 Creating indexes:\n');

    for (const index of indexes) {
      try {
        const result = await collection.createIndex(index.spec, {
          name: index.name,
          background: true,
        });
        console.log(`  ✅ ${index.name}: ${result}`);
        console.log(`     Reason: ${index.reason}\n`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('already exists')) {
          console.log(`  ⏭️  ${index.name}: Already exists (skipped)`);
          console.log(`     Reason: ${index.reason}\n`);
        } else {
          console.error(`  ❌ ${index.name}: Failed — ${msg}\n`);
        }
      }
    }

    // List all indexes
    const existingIndexes = await collection.indexes();
    console.log('\n📊 All indexes on collection:');
    for (const idx of existingIndexes) {
      console.log(`  • ${idx.name}: ${JSON.stringify(idx.key)}`);
    }

    console.log('\n✅ Index creation complete!');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createIndexes();
