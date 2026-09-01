import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_DATABASES = new Set(['admin', 'config', 'local']);

export async function GET() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return NextResponse.json(
      { error: 'MONGODB_URI is not configured on the server.' },
      { status: 500 }
    );
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const result = await client.db().admin().listDatabases();
    const databases = result.databases
      .map((database) => database.name)
      .filter((name) => !SYSTEM_DATABASES.has(name));

    return NextResponse.json({ databases });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load databases.';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.close();
  }
}
