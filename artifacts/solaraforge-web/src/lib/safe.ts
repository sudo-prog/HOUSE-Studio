/**
 * Defensive data helpers for API responses that may arrive in inconsistent
 * shapes (array, undefined, {data:[...]}, error object) depending on whether a
 * real backend is present. Used by widgets so a single bad response can never
 * crash the whole app.
 */
export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as any).data)) {
    return (value as any).data as T[];
  }
  return [];
}
