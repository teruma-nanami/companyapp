// src/pages/DateRequest.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import type { DateRequest, DateRequestSession } from "../types/dateRequest";
import { normalizeDateOnly, showOrDash } from "../utils/normalize";

function sessionLabel(v: string) {
  if (v === "full") return "終日";
  if (v === "am") return "午前";
  if (v === "pm") return "午後";
  return v;
}

function statusLabel(v: string) {
  if (v === "pending") return "申請中";
  if (v === "approved") return "承認";
  if (v === "rejected") return "却下";
  return v;
}

/**
 * エラー本文（json/text）から “人間向け” メッセージを作る
 * - overlap の RuntimeException もここで吸収する
 */
async function readErrorMessage(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "";
  const isJson = ct.includes("application/json");

  try {
    if (isJson) {
      const j = (await res.json()) as any;
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
    }

    const t = await res.text();
    if (t && t.includes("Date request overlaps")) {
      return "この期間は、すでに申請（申請中/承認済み）があるため作成できません。日付をずらしてください。";
    }

    return t || `Request failed: ${res.status}`;
  } catch {
    return `Request failed: ${res.status}`;
  }
}

export default function DateRequestPage() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [items, setItems] = useState<DateRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // フォーム（最低限）
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD
  const [session, setSession] = useState<DateRequestSession>("full");
  const [reason, setReason] = useState("");

  function load() {
    if (!isAuthenticated) {
      setError("一覧の取得にはログインが必要です。");
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    getAccessTokenSilently()
      .then((token) => {
        return fetch("/api/date-requests", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await readErrorMessage(res);
          throw new Error(msg);
        }
        return res.json();
      })
      .then((json) => {
        // このAPIは「配列」で返す（ApiControllerのenvelopeではない）
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

  function create() {
    if (!isAuthenticated) {
      setError("作成にはログインが必要です。");
      return;
    }

    if (!startDate || !endDate || !reason.trim()) {
      setError("start_date / end_date / reason は必須です。");
      return;
    }

    setCreating(true);
    setError("");

    getAccessTokenSilently()
      .then((token) => {
        return fetch("/api/date-requests", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            start_date: startDate,
            end_date: endDate,
            session,
            reason,
          }),
        });
      })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await readErrorMessage(res);
          throw new Error(msg);
        }
        return res.json();
      })
      .then(() => {
        setReason("");
        load();
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to create");
      })
      .finally(() => setCreating(false));
  }

  useEffect(() => {
    if (isAuthenticated) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold">休日申請</h1>

        <p className="mt-3 text-sm">このページはログインが必要です。</p>

        <button
          className="mt-2 rounded border px-3 py-1 text-sm"
          onClick={() => loginWithRedirect()}
        >
          ログイン
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">休日申請</h1>

      <div className="mt-3 rounded border bg-white p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-xs text-slate-600">開始日</div>
            <input
              className="mt-1 rounded border px-2 py-1 text-sm"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs text-slate-600">終了日</div>
            <input
              className="mt-1 rounded border px-2 py-1 text-sm"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs text-slate-600">区分</div>
            <select
              className="mt-1 rounded border px-2 py-1 text-sm"
              value={session}
              onChange={(e) => setSession(e.target.value as DateRequestSession)}
            >
              <option value="full">終日</option>
              <option value="am">午前</option>
              <option value="pm">午後</option>
            </select>
          </div>

          <div className="min-w-[260px] flex-1">
            <div className="text-xs text-slate-600">理由</div>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例）私用のため"
            />
          </div>

          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={create}
            disabled={creating}
          >
            {creating ? "送信中..." : "申請する"}
          </button>

          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={load}
            disabled={loading}
          >
            {loading ? "読込中..." : "再読込"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm" style={{ color: "crimson" }}>
            Error: {error}
          </p>
        )}
      </div>

      <div className="mt-4 overflow-auto rounded border bg-white">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">id</th>
              <th className="p-2">start_date</th>
              <th className="p-2">end_date</th>
              <th className="p-2">session</th>
              <th className="p-2">status</th>
              <th className="p-2">reason</th>
              <th className="p-2">rejected_reason</th>
              <th className="p-2">created_at</th>
            </tr>
          </thead>

          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{normalizeDateOnly(r.start_date)}</td>
                <td className="p-2">{normalizeDateOnly(r.end_date)}</td>
                <td className="p-2">{sessionLabel(String(r.session))}</td>
                <td className="p-2">{statusLabel(String(r.status))}</td>
                <td className="p-2">{r.reason}</td>
                <td className="p-2">
                  {showOrDash((r.rejected_reason ?? "").trim())}
                </td>
                <td className="p-2">{normalizeDateOnly(r.created_at)}</td>
              </tr>
            ))}

            {items.length === 0 && !loading && !error && (
              <tr>
                <td className="p-2" colSpan={8}>
                  データなし
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
