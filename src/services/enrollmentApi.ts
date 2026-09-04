/**
 * Enrollment API Service Layer
 *
 * A centralized, typed wrapper around all fetch calls related to
 * enrollment form submission. Keeps page.tsx clean and makes the
 * API contract easy to maintain, test, and extend.
 */

import { EnrollmentFormData } from '../types/enrollment';
import { flattenFormData } from '../utils/exportHelpers';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubmitEnrollmentPayload {
  referenceId: string;
  formData: EnrollmentFormData;
}

export interface SubmitEnrollmentResponse {
  success: boolean;
  referenceId: string;
  insertedId?: string;
  message?: string;
  error?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = '/api';
const TIMEOUT_MS = 15_000; // 15 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_200;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Wraps fetch with an AbortController timeout.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s — please check your connection.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Exponential-backoff retry wrapper.
 * Retries only on network errors or 5xx server errors, never on 4xx.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delayMs = RETRY_DELAY_MS
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isRetryable =
        err?.status === undefined ||
        (typeof err?.status === 'number' && err.status >= 500);

      if (!isRetryable || attempt === retries) break;

      await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/**
 * Submit enrollment form data to the internal Next.js API route
 * which persists it in MongoDB Atlas.
 */
export async function submitEnrollment(
  payload: SubmitEnrollmentPayload
): Promise<SubmitEnrollmentResponse> {
  const { referenceId, formData } = payload;
  const flatData = flattenFormData(formData, referenceId);

  const body = JSON.stringify({ referenceId, flatData, fullData: formData });

  return withRetry(async () => {
    const response = await fetchWithTimeout(`${API_BASE}/enrollment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    let data: SubmitEnrollmentResponse;
    try {
      data = await response.json();
    } catch {
      throw Object.assign(new Error('Server returned non-JSON response'), {
        status: response.status,
      });
    }

    if (!response.ok) {
      throw Object.assign(
        new Error(data.error ?? `Submission failed (HTTP ${response.status})`),
        { status: response.status }
      );
    }

    return data;
  });
}

/**
 * Optionally forward submission to an external webhook / external API.
 * Configured via NEXT_PUBLIC_API_ENDPOINT env variable.
 * Failures here are non-fatal — logged as warnings only.
 */
export async function notifyExternalEndpoint(
  payload: SubmitEnrollmentPayload
): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  if (!endpoint) return;

  const { referenceId, formData } = payload;
  const flatData = flattenFormData(formData, referenceId);

  try {
    const response = await fetchWithTimeout(
      endpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceId, flatData, fullData: formData }),
      },
      10_000
    );

    if (!response.ok) {
      console.warn(`[enrollmentApi] External endpoint returned HTTP ${response.status}`);
    }
  } catch (err) {
    console.warn('[enrollmentApi] External endpoint notification failed:', err);
  }
}
