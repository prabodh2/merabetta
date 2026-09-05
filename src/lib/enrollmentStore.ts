import { MongoClient, ObjectId } from 'mongodb';
import { EnrollmentRecord, EnrollmentStatus, EnrollmentFormData } from '../types/enrollment';
import clientPromise from './mongodb';
import { flattenFormData } from '../utils/exportHelpers';

const DB_NAME = 'merabetta';
const COLLECTION_NAME = 'enrollments';

// Global in-memory cache for original records when MongoDB is not connected
declare global {
  // eslint-disable-next-line no-var
  var _memoryEnrollments: EnrollmentRecord[] | undefined;
}

// Ensure clean start with original data only (clears any old seed items)
if (!global._memoryEnrollments || global._memoryEnrollments.some((e) => e._id.startsWith('seed-'))) {
  global._memoryEnrollments = [];
}

const memoryStore = global._memoryEnrollments;

// Helper to safely get MongoDB Collection
async function getMongoCollection() {
  if (!process.env.MONGODB_URI) {
    return null;
  }
  try {
    const client = await clientPromise;
    return client.db(DB_NAME).collection(COLLECTION_NAME);
  } catch (error) {
    console.warn('[enrollmentStore] MongoDB Atlas not available, using memory store fallback:', error);
    return null;
  }
}

// ── Query Types ───────────────────────────────────────────────────────────────
export interface GetEnrollmentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EnrollmentsListResult {
  records: EnrollmentRecord[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  stats: {
    total: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
}

// ── Public Store Methods ──────────────────────────────────────────────────────

/**
 * Fetch paginated enrollments list with live search, status filter, and KPI stats
 */
export async function getEnrollments(
  params: GetEnrollmentsParams = {}
): Promise<EnrollmentsListResult> {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Number(params.limit) || 10);
  const search = (params.search || '').trim().toLowerCase();
  const status = (params.status || 'all').trim().toLowerCase();
  const sortOrder = params.sortOrder === 'asc' ? 1 : -1;

  const collection = await getMongoCollection();

  if (collection) {
    try {
      // Build MongoDB query
      const query: Record<string, unknown> = {};

      if (status && status !== 'all') {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { referenceId: { $regex: search, $options: 'i' } },
          { 'fullData.homeName': { $regex: search, $options: 'i' } },
          { 'fullData.city': { $regex: search, $options: 'i' } },
          { 'fullData.contactPersonName': { $regex: search, $options: 'i' } },
          { 'fullData.mobileNumber': { $regex: search, $options: 'i' } },
          { 'fullData.ownerName': { $regex: search, $options: 'i' } },
        ];
      }

      const totalRecords = await collection.countDocuments(query);
      const totalPages = Math.ceil(totalRecords / limit) || 1;
      const skip = (page - 1) * limit;

      const cursor = collection
        .find(query)
        .sort({ submittedAt: sortOrder })
        .skip(skip)
        .limit(limit);

      const rawItems = await cursor.toArray();

      const records: EnrollmentRecord[] = rawItems.map((item) => ({
        _id: item._id.toString(),
        referenceId: item.referenceId || `MB-OAH-${item._id.toString().slice(-6)}`,
        status: (item.status as EnrollmentStatus) || 'submitted',
        adminNotes: item.adminNotes || '',
        reviewedAt: item.reviewedAt || undefined,
        reviewedBy: item.reviewedBy || '',
        submittedAt: item.submittedAt || new Date().toISOString(),
        fullData: (item.fullData || item) as EnrollmentFormData,
        flatData: item.flatData || undefined,
      }));

      // Stats counts
      const [totalCount, submittedCount, approvedCount, rejectedCount] = await Promise.all([
        collection.countDocuments({}),
        collection.countDocuments({ status: 'submitted' }),
        collection.countDocuments({ status: 'approved' }),
        collection.countDocuments({ status: 'rejected' }),
      ]);

      return {
        records,
        totalRecords,
        totalPages,
        currentPage: page,
        limit,
        stats: {
          total: totalCount,
          submitted: submittedCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
      };
    } catch (err) {
      console.error('[getEnrollments] MongoDB query failed, falling back to memory store:', err);
    }
  }

  // Fallback to in-memory store
  let filtered = [...memoryStore];

  if (status && status !== 'all') {
    filtered = filtered.filter((item) => item.status === status);
  }

  if (search) {
    filtered = filtered.filter((item) => {
      const fd = item.fullData || ({} as EnrollmentFormData);
      return (
        item.referenceId?.toLowerCase().includes(search) ||
        fd.homeName?.toLowerCase().includes(search) ||
        fd.city?.toLowerCase().includes(search) ||
        fd.contactPersonName?.toLowerCase().includes(search) ||
        fd.mobileNumber?.toLowerCase().includes(search) ||
        fd.ownerName?.toLowerCase().includes(search)
      );
    });
  }

  // Sort
  filtered.sort((a, b) => {
    const timeA = new Date(a.submittedAt).getTime();
    const timeB = new Date(b.submittedAt).getTime();
    return sortOrder === 1 ? timeA - timeB : timeB - timeA;
  });

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const startIdx = (page - 1) * limit;
  const records = filtered.slice(startIdx, startIdx + limit);

  const stats = {
    total: memoryStore.length,
    submitted: memoryStore.filter((m) => m.status === 'submitted').length,
    approved: memoryStore.filter((m) => m.status === 'approved').length,
    rejected: memoryStore.filter((m) => m.status === 'rejected').length,
  };

  return {
    records,
    totalRecords,
    totalPages,
    currentPage: page,
    limit,
    stats,
  };
}

/**
 * Get a single enrollment by MongoDB _id OR Reference ID
 */
export async function getEnrollmentById(idOrRef: string): Promise<EnrollmentRecord | null> {
  const collection = await getMongoCollection();

  if (collection) {
    try {
      let query: Record<string, unknown> = { referenceId: idOrRef };
      if (ObjectId.isValid(idOrRef)) {
        query = {
          $or: [{ _id: new ObjectId(idOrRef) }, { referenceId: idOrRef }],
        };
      }

      const item = await collection.findOne(query);
      if (item) {
        return {
          _id: item._id.toString(),
          referenceId: item.referenceId || `MB-OAH-${item._id.toString().slice(-6)}`,
          status: (item.status as EnrollmentStatus) || 'submitted',
          adminNotes: item.adminNotes || '',
          reviewedAt: item.reviewedAt || undefined,
          reviewedBy: item.reviewedBy || '',
          submittedAt: item.submittedAt || new Date().toISOString(),
          fullData: (item.fullData || item) as EnrollmentFormData,
          flatData: item.flatData || undefined,
        };
      }
    } catch (err) {
      console.error('[getEnrollmentById] MongoDB query failed:', err);
    }
  }

  // Fallback memory store
  const found = memoryStore.find(
    (m) => m._id === idOrRef || m.referenceId?.toLowerCase() === idOrRef.toLowerCase()
  );
  return found || null;
}

/**
 * Update an enrollment's status and admin notes
 */
export async function updateEnrollmentStatus(
  idOrRef: string,
  updates: {
    status: EnrollmentStatus;
    adminNotes?: string;
    reviewedBy?: string;
  }
): Promise<EnrollmentRecord | null> {
  const collection = await getMongoCollection();
  const reviewedAt = new Date().toISOString();

  if (collection) {
    try {
      let query: Record<string, unknown> = { referenceId: idOrRef };
      if (ObjectId.isValid(idOrRef)) {
        query = {
          $or: [{ _id: new ObjectId(idOrRef) }, { referenceId: idOrRef }],
        };
      }

      const updateFields: Record<string, unknown> = {
        status: updates.status,
        reviewedAt,
      };
      if (updates.adminNotes !== undefined) updateFields.adminNotes = updates.adminNotes;
      if (updates.reviewedBy !== undefined) updateFields.reviewedBy = updates.reviewedBy;

      await collection.updateOne(query, { $set: updateFields });
      return getEnrollmentById(idOrRef);
    } catch (err) {
      console.error('[updateEnrollmentStatus] MongoDB update failed:', err);
    }
  }

  // Fallback memory store update
  const idx = memoryStore.findIndex(
    (m) => m._id === idOrRef || m.referenceId?.toLowerCase() === idOrRef.toLowerCase()
  );

  if (idx !== -1) {
    memoryStore[idx] = {
      ...memoryStore[idx],
      status: updates.status,
      adminNotes: updates.adminNotes ?? memoryStore[idx].adminNotes,
      reviewedBy: updates.reviewedBy ?? memoryStore[idx].reviewedBy,
      reviewedAt,
    };
    return memoryStore[idx];
  }

  return null;
}

/**
 * Save new enrollment into database
 */
export async function saveEnrollment(payload: {
  referenceId?: string;
  flatData?: Record<string, unknown>;
  fullData: EnrollmentFormData;
}): Promise<{ insertedId: string; referenceId: string }> {
  const referenceId =
    payload.referenceId || `MB-OAH-${Math.floor(100000 + Math.random() * 900000)}`;
  const submittedAt = new Date().toISOString();
  const flatData = payload.flatData || flattenFormData(payload.fullData, referenceId);

  const docToInsert = {
    referenceId,
    flatData,
    fullData: payload.fullData,
    submittedAt,
    status: 'submitted' as EnrollmentStatus,
    adminNotes: '',
  };

  const collection = await getMongoCollection();

  if (collection) {
    try {
      const result = await collection.insertOne(docToInsert);
      return {
        insertedId: result.insertedId.toString(),
        referenceId,
      };
    } catch (err) {
      console.error('[saveEnrollment] MongoDB insert failed, saving to memory:', err);
    }
  }

  // Memory fallback save
  const newRecord: EnrollmentRecord = {
    _id: `mem-${Date.now()}`,
    referenceId,
    status: 'submitted',
    submittedAt,
    fullData: payload.fullData,
    flatData,
  };
  memoryStore.unshift(newRecord);

  return {
    insertedId: newRecord._id,
    referenceId,
  };
}

/**
 * Delete an enrollment record by MongoDB _id OR Reference ID
 */
export async function deleteEnrollment(idOrRef: string): Promise<boolean> {
  const collection = await getMongoCollection();

  if (collection) {
    try {
      let query: Record<string, unknown> = { referenceId: idOrRef };
      if (ObjectId.isValid(idOrRef)) {
        query = {
          $or: [{ _id: new ObjectId(idOrRef) }, { referenceId: idOrRef }],
        };
      }
      const res = await collection.deleteOne(query);
      return (res.deletedCount ?? 0) > 0;
    } catch (err) {
      console.error('[deleteEnrollment] MongoDB delete failed:', err);
    }
  }

  const idx = memoryStore.findIndex(
    (m) => m._id === idOrRef || m.referenceId?.toLowerCase() === idOrRef.toLowerCase()
  );
  if (idx !== -1) {
    memoryStore.splice(idx, 1);
    return true;
  }
  return false;
}

