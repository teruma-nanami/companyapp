// src/hooks/timeRequests/useTimeRequests.ts
import { useState } from "react";
import type { TimeRequest } from "../../types/timeRequest";
import { fetchJson } from "../../utils/http";
import { unwrapArray, unwrapData } from "../../utils/unwrap";
import { useAuthToken } from "../useAuthToken";

export function useTimeRequests() {
  const { authFetch } = useAuthToken();

  const [items, setItems] = useState<TimeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function clear(): void {
    setItems([]);
    setError("");
  }

  function loadMine(): Promise<void> {
    setLoading(true);
    setError("");

    return fetchJson(authFetch, "/api/time-requests", { method: "GET" })
      .then((json) => {
        // controller は生配列 or {data,message} どっちでも耐える
        setItems(unwrapArray<TimeRequest>(json));
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function create(input: {
    attendanceId: number;
    requested_check_in_at: string; // ISO文字列
    requested_check_out_at: string | null; // ISO文字列 or null
    reason: string;
  }): Promise<TimeRequest | null> {
    setLoading(true);
    setError("");

    return fetchJson(
      authFetch,
      `/api/attendances/${input.attendanceId}/time-requests`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requested_check_in_at: input.requested_check_in_at,
          requested_check_out_at: input.requested_check_out_at,
          reason: input.reason,
        }),
      },
    )
      .then((json) => {
        const created = unwrapData<TimeRequest>(json);
        // 申請一覧も最新化（分かりやすい挙動）
        return loadMine().then(() => created);
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to create");
        return null;
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return {
    items,
    loading,
    error,
    loadMine,
    create,
    clear,
  };
}
