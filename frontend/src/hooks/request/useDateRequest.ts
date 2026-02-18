// src/hooks/request/useDateRequest.ts
import { useEffect, useState } from "react";
import type { DateRequest, DateRequestSession } from "../../types/dateRequest";
import { useAuthToken } from "../useAuthToken";

function readErrorMessage(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "";
  const isJson = ct.includes("application/json");

  if (isJson) {
    return res
      .json()
      .then((j: any) => {
        const msg =
          typeof j?.message === "string"
            ? j.message
            : `Request failed: ${res.status}`;

        if (msg.includes("Date request overlaps")) {
          return "この期間は、すでに申請（申請中/承認済み）があるため作成できません。日付をずらしてください。";
        }

        if (msg.includes("Authentication token is missing")) {
          return "認証トークンがありません。ログインし直してください。";
        }

        return msg;
      })
      .catch(() => `Request failed: ${res.status}`);
  }

  return res
    .text()
    .then((t) => {
      if (t && t.includes("Date request overlaps")) {
        return "この期間は、すでに申請（申請中/承認済み）があるため作成できません。日付をずらしてください。";
      }
      return t || `Request failed: ${res.status}`;
    })
    .catch(() => `Request failed: ${res.status}`);
}

export function useDateRequest() {
  const { isAuthenticated, authFetch } = useAuthToken();

  const [items, setItems] = useState<DateRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  function load(): void {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    authFetch("/api/date-requests", { method: "GET" })
      .then((res) => {
        if (!res.ok) {
          return readErrorMessage(res).then((msg) => {
            throw new Error(msg);
          });
        }
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) {
          setItems(json as DateRequest[]);
        } else {
          setItems([]);
        }
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
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
      .then((res) => {
        if (!res.ok) {
          return readErrorMessage(res).then((msg) => {
            throw new Error(msg);
          });
        }
        return res.json();
      })
      .then(() => {
        load();
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to create");
        throw e;
      })
      .finally(() => {
        setSaving(false);
      });
  }

  useEffect(() => {
    if (isAuthenticated) load();
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
