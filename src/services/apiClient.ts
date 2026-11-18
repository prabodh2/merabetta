const configuredBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

/** Build a staging API URL without ever duplicating the `/api` prefix. */
export function apiUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, '').replace(/^api\//, '');
  return configuredBase
    ? `${configuredBase}/${normalizedPath}`
    : `/api/${normalizedPath}`;
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => ({ error: 'Server returned an invalid response.' }));
  if (!response.ok) {
    const message = typeof result?.error === 'string'
      ? result.error
      : `API request failed (HTTP ${response.status}).`;
    throw new Error(message);
  }
  return result as T;
}
