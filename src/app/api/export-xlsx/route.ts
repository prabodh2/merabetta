import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_DATABASES = new Set(['admin', 'config', 'local']);

function sheetName(name: string, usedNames: Set<string>) {
  const cleaned = name.replace(/[\[\]:*?/\\]/g, '_').slice(0, 31) || 'sheet';
  let candidate = cleaned;
  let counter = 1;

  while (usedNames.has(candidate)) {
    const suffix = `_${counter}`;
    candidate = `${cleaned.slice(0, 31 - suffix.length)}${suffix}`;
    counter += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function serializeValue(value: unknown): unknown {
  if (value instanceof ObjectId) return value.toHexString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, serializeValue(nestedValue)])
    );
  }
  return value;
}

function flattenRecord(value: unknown, prefix = '', output: Record<string, unknown> = {}) {
  if (!value || typeof value !== 'object' || value instanceof Date || value instanceof ObjectId) {
    output[prefix || 'value'] = serializeValue(value);
    return output;
  }

  if (Array.isArray(value)) {
    output[prefix || 'value'] = JSON.stringify(serializeValue(value));
    return output;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (
      nestedValue &&
      typeof nestedValue === 'object' &&
      !Array.isArray(nestedValue) &&
      !(nestedValue instanceof Date) &&
      !(nestedValue instanceof ObjectId)
    ) {
      flattenRecord(nestedValue, nextKey, output);
    } else {
      const serialized = serializeValue(nestedValue);
      output[nextKey] =
        Array.isArray(serialized) || (serialized && typeof serialized === 'object')
          ? JSON.stringify(serialized)
          : serialized;
    }
  }

  return output;
}

async function databaseNames(client: MongoClient, selectedDatabase: string | null) {
  if (selectedDatabase && selectedDatabase !== 'all') {
    return [selectedDatabase];
  }

  const result = await client.db().admin().listDatabases();
  return result.databases
    .map((database) => database.name)
    .filter((name) => !SYSTEM_DATABASES.has(name));
}

export async function GET(request: Request) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return NextResponse.json(
      { error: 'MONGODB_URI is not configured on the server.' },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const selectedDatabase = url.searchParams.get('database');
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const workbook = XLSX.utils.book_new();
    const usedNames = new Set<string>();
    const names = await databaseNames(client, selectedDatabase);

    if (names.length === 0) {
      const worksheet = XLSX.utils.json_to_sheet([{ status: 'No databases found' }]);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'empty');
    }

    for (const databaseName of names) {
      const db = client.db(databaseName);
      const collections = await db.listCollections().toArray();

      if (collections.length === 0) {
        const worksheet = XLSX.utils.json_to_sheet([{ database: databaseName, status: 'empty' }]);
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          sheetName(`${databaseName}_empty`, usedNames)
        );
        continue;
      }

      for (const collection of collections) {
        const documents = await db.collection(collection.name).find({}).toArray();
        const rows = documents.length
          ? documents.map((document) => flattenRecord(document))
          : [{ _empty_collection: true }];
        const worksheet = XLSX.utils.json_to_sheet(rows);

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          sheetName(`${databaseName}.${collection.name}`, usedNames)
        );
      }
    }

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="mongodb_export_${timestamp}.xlsx"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.close();
  }
}
