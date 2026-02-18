// src/hooks/useAttendanceLists.ts
import { useState } from "react";
import type { ApiEnvelope, Paginator } from "../../types/api";
import type { Attendance } from "../../types/attendance";
import { useAuthToken } from "../useAuthToken";

function pickErrorMessage(text: string): string {
  try {
    const obj = JSON.parse(text) as any;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return text || "Request failed";
}

function unwrapAttendanceList(json: any): {
  items: Attendance[];
  page: number;
  lastPage: number;
  total: number;
} {
  // 1) ok(): { data: [...] }
  if (Array.isArray(json?.data)) {
    return {
      items: json.data as Attendance[],
      page: 1,
      lastPage: 1,
      total: (json.data as Attendance[]).length,
    };
  }

  // 2) ok(): { data: { data: [...], current_page, last_page, total } } (paginate)
  if (
    json?.data &&
    typeof json.data === "object" &&
    Array.isArray(json.data.data)
  ) {
    const p = json.data as Paginator<Attendance>;
    return {
      items: p.data ?? [],
      page: Number(p.current_page ?? 1),
      lastPage: Number(p.last_page ?? 1),
      total: Number(p.total ?? p.data?.length ?? 0),
    };
  }

  // 3) 生配列
  if (Array.isArray(json)) {
    return {
      items: json as Attendance[],
      page: 1,
      lastPage: 1,
      total: (json as Attendance[]).length,
    };
  }

  return { items: [], page: 1, lastPage: 1, total: 0 };
}

export function useAttendanceLists() {
  const { authFetch } = useAuthToken();

  const [items, setItems] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  function clear() {
    setItems([]);
    setError("");
    setPage(1);
    setLastPage(1);
    setTotal(0);
  }

  function load(nextPage = 1) {
    setLoading(true);
    setError("");

    authFetch(`/api/attendances?page=${nextPage}`, { method: "GET" })
      .then(async (res) => {
        if (!res.ok) {
          const t = await res.text();
          throw new Error(pickErrorMessage(t));
        }
        return (await res.json()) as ApiEnvelope<any> | any;
      })
      .then((json) => {
        const u = unwrapAttendanceList(json);
        setItems(u.items);
        setPage(u.page);
        setLastPage(u.lastPage);
        setTotal(u.total);
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return {
    items,
    loading,
    error,

    page,
    lastPage,
    total,

    load,
    clear,
    setPage,
  };
}
