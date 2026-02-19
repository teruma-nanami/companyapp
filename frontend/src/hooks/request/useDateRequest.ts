// src/hooks/request/useDateRequest.ts
import { useEffect, useState } from "react";
import type { DateRequest, DateRequestSession } from "../../types/dateRequest";
import { fetchJson } from "../../utils/http";
import { readErrorMessage } from "../../utils/message";
import { unwrapArray, unwrapData } from "../../utils/unwrap";
import { useAuthToken } from "../useAuthToken";

function translateDateRequestError(message: string): string {
  const msg = message || "Request failed";

  if (msg.includes("Date request overlaps")) {
    return "この期間は、すでに申請（申請中/承認済み）があるため作成できません。日付をずらしてください。";
  }

  if (msg.includes("Authentication token is missing")) {
    return "認証トークンがありません。ログインし直してください。";
  }

  return msg;
}

export function useDateRequest() {
  const { isAuthenticated, authFetch } = useAuthToken();

  const [items, setItems] = useState<DateRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function clear(): void {
    setItems([]);
    setError("");
    setLoading(false);
    setSaving(false);
  }

  function unwrapDateRequests(json: unknown): DateRequest[] {
    // ApiController形式 { data, message } / 生配列 の両方を吸収
    return unwrapArray<DateRequest>(json);
  }

  function load(): void {
    if (!isAuthenticated) {
      clear();
      return;
    }

    setLoading(true);
    setError("");

    fetchJson(authFetch, "/api/date-requests", { method: "GET" })
      .then((json) => {
        setItems(unwrapDateRequests(json));
      })
      .catch((e: any) => {
        setError(translateDateRequestError(e?.message ?? "failed to load"));
        setItems([]);
      })
      .finally(() => setLoading(false));
  }

  function create(input: {
    start_date: string;
    end_date: string;
    session: DateRequestSession;
    reason: string;
  }): Promise<void> {
    if (!isAuthenticated) return Promise.resolve();

    setSaving(true);
    setError("");

    return authFetch("/api/date-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_date: input.start_date,
        end_date: input.end_date,
        session: input.session,
        reason: input.reason,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await readErrorMessage(res);
          throw new Error(translateDateRequestError(msg));
        }
        return (await res.json()) as unknown;
      })
      .then((json) => {
        // created() が { data, message } の場合もあるので一応吸収（使わなくてもOK）
        unwrapData<unknown>(json);
        load();
      })
      .catch((e: any) => {
        setError(translateDateRequestError(e?.message ?? "failed to create"));
        throw e;
      })
      .finally(() => {
        setSaving(false);
      });
  }

  useEffect(() => {
    if (isAuthenticated) load();
    else clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    items,
    loading,
    error,
    saving,
    load,
    create,
  };
}
