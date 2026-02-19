// src/utils/unwrap.ts

/**
 * ApiController の envelope ({ data, message }) / 生JSON の揺れを吸収して data を取り出す
 * - json が { data: ... } なら data を返す
 * - それ以外なら json をそのまま返す
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unwrapData<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as any).data as T;
  }
  return json as T;
}

export function unwrapArray<T>(json: unknown): T[] {
  const data = unwrapData<unknown>(json);
  return Array.isArray(data) ? (data as T[]) : [];
}

export function unwrapPaginatorArray<T>(json: unknown): T[] {
  const data = unwrapData<unknown>(json);

  // 生配列
  if (Array.isArray(data)) return data as T[];

  // paginate: { data: [...] }
  if (data && typeof data === "object" && Array.isArray((data as any).data)) {
    return (data as any).data as T[];
  }

  return [];
}
