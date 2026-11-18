import { EnrollmentFormData, UploadedFileItem } from '../types/enrollment';
import { apiUrl, readApiResponse } from './apiClient';

const API_ROOT = apiUrl('/app/enrollments');
const DB_NAME = 'merabetta-enrollment-uploads';
const STORE_NAME = 'uploads';
const RECORD_KEY = 'active-enrollment';

interface CompletedPart {
  partNumber: number;
  etag: string;
}

interface CachedUploadFile {
  key: string;
  field: string;
  fileName: string;
  contentType: string;
  size: number;
  blob: Blob;
  fileToken?: string;
  partCount?: number;
  chunkSize?: number;
  nextPartNumber: number;
  parts: CompletedPart[];
  receipt?: unknown;
}

interface UploadRecord {
  id: typeof RECORD_KEY;
  sessionToken?: string;
  chunkSize?: number;
  files: CachedUploadFile[];
}

export interface UploadProgress {
  fileName: string;
  fileIndex: number;
  fileCount: number;
  partNumber: number;
  partCount: number;
  percent: number;
}

interface UploadSessionResponse {
  sessionToken: string;
  chunkSize: number;
}

interface FileInitResponse {
  fileToken: string;
  partCount: number;
  chunkSize?: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open the upload cache.'));
  });
}

async function readRecord(): Promise<UploadRecord> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(RECORD_KEY);
    request.onsuccess = () => resolve(request.result ?? { id: RECORD_KEY, files: [] });
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

async function writeRecord(record: UploadRecord): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}

async function api<T>(path: string, body: object, method = 'POST'): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readApiResponse<T>(response);
}

function itemToCached(field: string, index: number, item: UploadedFileItem): CachedUploadFile | null {
  if (!item.file) return null;
  return {
    key: `${field}:${index}`,
    field,
    fileName: item.name,
    contentType: item.file.type || item.type,
    size: item.file.size,
    blob: item.file,
    nextPartNumber: 1,
    parts: [],
  };
}

function collectDocumentFiles(documents: EnrollmentFormData['documents']): CachedUploadFile[] {
  const files: CachedUploadFile[] = [];
  const singleFields = [
    'facilityVideo', 'registrationCertificate', 'panCard', 'gstCertificate',
    'addressProof', 'representativeIdProof', 'bankAccountDetails',
  ] as const;
  for (const field of singleFields) {
    const cached = documents[field] && itemToCached(field, 0, documents[field]);
    if (cached) files.push(cached);
  }
  for (const [field, items] of [
    ['facilityPhotographs', documents.facilityPhotographs ?? []],
    ['licensesCertificates', documents.licensesCertificates ?? []],
  ] as const) {
    items.forEach((item, index) => {
      const cached = itemToCached(field, index, item);
      if (cached) files.push(cached);
    });
  }
  return files;
}

function sameFile(left: CachedUploadFile, right: CachedUploadFile) {
  return left.key === right.key && left.fileName === right.fileName &&
    left.size === right.size && left.contentType === right.contentType;
}

/** Cache selected browser files in IndexedDB and abort removed in-progress S3 uploads. */
export async function cacheSelectedFiles(documents: EnrollmentFormData['documents']): Promise<void> {
  const record = await readRecord();
  const selected = collectDocumentFiles(documents);
  const retained = selected.map((file) => record.files.find((old) => sameFile(old, file)) ?? file);
  const removed = record.files.filter((old) => old.field !== 'digitalSignature' && !retained.some((file) => sameFile(old, file)));
  await Promise.all(removed.filter((file) => file.fileToken && !file.receipt).map((file) =>
    api('/upload-sessions/file', { fileToken: file.fileToken }, 'DELETE').catch(() => undefined)
  ));
  record.files = [...retained, ...record.files.filter((file) => file.field === 'digitalSignature')];
  await writeRecord(record);
}

export async function restoreCachedDocuments(): Promise<EnrollmentFormData['documents'] | null> {
  const record = await readRecord();
  const files = record.files.filter((file) => file.field !== 'digitalSignature');
  if (!files.length) return null;
  const documents: EnrollmentFormData['documents'] = { facilityPhotographs: [], licensesCertificates: [] };
  for (const cached of files) {
    const file = new File([cached.blob], cached.fileName, { type: cached.contentType });
    const item: UploadedFileItem = {
      id: cached.key,
      name: cached.fileName,
      size: cached.size,
      type: cached.contentType,
      file,
      uploadedAt: new Date().toISOString(),
    };
    if (cached.field === 'facilityPhotographs') documents.facilityPhotographs?.push(item);
    else if (cached.field === 'licensesCertificates') documents.licensesCertificates?.push(item);
    else documents[cached.field as keyof Omit<typeof documents, 'facilityPhotographs' | 'licensesCertificates'>] = item;
  }
  return documents;
}

function signatureToJpeg(dataUri: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(image.naturalWidth, 1);
      canvas.height = Math.max(image.naturalHeight, 1);
      const context = canvas.getContext('2d');
      if (!context) return reject(new Error('Could not prepare the digital signature.'));
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Could not prepare the digital signature.'));
        resolve(new File([blob], 'signature.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.92);
    };
    image.onerror = () => reject(new Error('The digital signature is invalid.'));
    image.src = dataUri;
  });
}

async function ensureSession(record: UploadRecord) {
  if (record.sessionToken && record.chunkSize) return;
  const session = await api<UploadSessionResponse>('/upload-sessions', {});
  record.sessionToken = session.sessionToken;
  record.chunkSize = session.chunkSize;
  await writeRecord(record);
}

async function uploadOneFile(record: UploadRecord, file: CachedUploadFile, onProgress?: (progress: UploadProgress) => void, fileIndex = 0) {
  if (file.receipt) return file.receipt;
  if (!file.fileToken || !file.partCount) {
    const initialized = await api<FileInitResponse>('/upload-sessions/files', {
      sessionToken: record.sessionToken,
      field: file.field,
      fileName: file.fileName,
      contentType: file.contentType,
      size: file.size,
    });
    file.fileToken = initialized.fileToken;
    file.partCount = initialized.partCount;
    file.chunkSize = initialized.chunkSize ?? record.chunkSize;
    await writeRecord(record);
  }

  const chunkSize = file.chunkSize ?? record.chunkSize;
  if (!chunkSize) throw new Error('The upload server did not provide a chunk size.');
  for (let partNumber = file.nextPartNumber; partNumber <= file.partCount; partNumber += 1) {
    const signed = await api<{ url: string }>('/upload-sessions/part-url', { fileToken: file.fileToken, partNumber });
    const start = (partNumber - 1) * chunkSize;
    const upload = await fetch(signed.url, {
      method: 'PUT',
      body: file.blob.slice(start, Math.min(start + chunkSize, file.size), file.contentType),
    });
    if (!upload.ok) throw new Error(`${file.fileName}: chunk ${partNumber} failed.`);
    const etag = upload.headers.get('ETag');
    if (!etag) throw new Error('S3 CORS must expose the ETag response header.');
    file.parts.push({ partNumber, etag });
    file.nextPartNumber = partNumber + 1;
    await writeRecord(record);
    onProgress?.({
      fileName: file.fileName,
      fileIndex,
      fileCount: record.files.length,
      partNumber,
      partCount: file.partCount,
      percent: Math.round(((fileIndex + partNumber / file.partCount) / record.files.length) * 100),
    });
  }
  const completed = await api<{ receipt: unknown }>('/upload-sessions/complete', {
    fileToken: file.fileToken,
    parts: file.parts,
  });
  file.receipt = completed.receipt;
  await writeRecord(record);
  return file.receipt;
}

function createPayload(referenceId: string, formData: EnrollmentFormData) {
  const excluded = new Set([
    'documents', 'digitalSignature', 'registrationNumber', 'contactPersonName',
    'designation', 'mobileNumber', 'emailAddress', 'submissionDate', 'ownerName',
    'ownerPhone', 'ownerEmail', 'commercialAgreed', 'declarationAgreed',
  ]);
  const clientFields = Object.fromEntries(Object.entries(formData).filter(([key]) => !excluded.has(key)));
  return {
    poc_client: { referenceId, ...clientFields },
    poc_admin: {
      registrationNumber: formData.registrationNumber,
      contactPersonName: formData.contactPersonName,
      designation: formData.designation,
      mobileNumber: formData.mobileNumber,
      emailAddress: formData.emailAddress,
      submissionDate: formData.submissionDate,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      ownerEmail: formData.ownerEmail,
      commercialAgreed: formData.commercialAgreed,
      declarationAgreed: formData.declarationAgreed,
    },
  };
}

export async function submitResumableEnrollment(
  referenceId: string,
  formData: EnrollmentFormData,
  onProgress?: (progress: UploadProgress) => void,
) {
  await cacheSelectedFiles(formData.documents);
  const signature = await signatureToJpeg(formData.digitalSignature);
  const record = await readRecord();
  const signatureFile = itemToCached('digitalSignature', 0, {
    id: 'digitalSignature:0', name: signature.name, size: signature.size,
    type: signature.type, file: signature, uploadedAt: new Date().toISOString(),
  });
  if (!signatureFile) throw new Error('Could not cache the digital signature.');
  const oldSignature = record.files.find((file) => file.field === 'digitalSignature');
  record.files = [...record.files.filter((file) => file.field !== 'digitalSignature'),
    oldSignature && sameFile(oldSignature, signatureFile) ? oldSignature : signatureFile];
  await writeRecord(record);
  await ensureSession(record);

  const receipts: unknown[] = [];
  for (let index = 0; index < record.files.length; index += 1) {
    receipts.push(await uploadOneFile(record, record.files[index], onProgress, index));
  }
  const response = await fetch(`${API_ROOT}/with-uploaded-files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: createPayload(referenceId, formData), receipts }),
  });
  const result = await readApiResponse<Record<string, unknown>>(response);
  if (response.status !== 201) throw new Error(`Enrollment failed (HTTP ${response.status}).`);
  await clearUploadCache();
  return result;
}

export async function cancelAllUploads() {
  const record = await readRecord();
  await Promise.all(record.files.filter((file) => file.fileToken && !file.receipt).map((file) =>
    api('/upload-sessions/file', { fileToken: file.fileToken }, 'DELETE').catch(() => undefined)
  ));
  await clearUploadCache();
}

export async function clearUploadCache() {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(RECORD_KEY);
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
