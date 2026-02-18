// src/hooks/timeRequests/useTimeRequests.ts
import { useState } from "react";
import type { TimeRequest } from "../../types/timeRequest";
import { useAuthToken } from "../useAuthToken";

type CreateTimeRequestInput = {
  attendanceId: number;
  requested_check_in_at: string; // ISO文字列を想定
  requested_check_out_at: string | null; // ISO文字列 or null
  reason: string;
};

function pickMessage(text: string): string {
  // Laravel: {"message":"..."} 形式を優先して拾う
  try {
    const obj = JSON.parse(text) as any;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return text || "Request failed";
}

export function useTimeRequests() {
  const { authFetch } = useAuthToken();

  const [items, setItems] = useState<TimeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadMine(): Promise<void> {
    setLoading(true);
    setError("");

    try {
      const res = await authFetch("/api/time-requests");
      if (!res.ok) throw new Error(pickMessage(await res.text()));

      // controller は response()->json($items) なので、生配列想定
      const json = (await res.json()) as unknown;
      const list = Array.isArray(json) ? (json as TimeRequest[]) : [];
      setItems(list);
    } catch (e: any) {
      setError(e?.message ?? "failed to load");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function create(
    input: CreateTimeRequestInput,
  ): Promise<TimeRequest | null> {
    setLoading(true);
    setError("");

    try {
      const res = await authFetch(
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
      );

      if (!res.ok) throw new Error(pickMessage(await res.text()));

      const created = (await res.json()) as TimeRequest;
      // 申請一覧も最新化しておく（初心者向けに分かりやすい挙動）
      await loadMine();
      return created;
    } catch (e: any) {
      setError(e?.message ?? "failed to create");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    items,
    loading,
    error,
    loadMine,
    create,
  };
}
