// src/pages/TimeRequestList.tsx
import { useEffect, useState } from "react";
import { useAuthToken } from "../hooks/useAuthToken";
import type { TimeRequest } from "../types/timeRequest";
import { formatUtcToJst } from "../utils/time";

function pickMessage(text: string): string {
  try {
    const obj = JSON.parse(text) as any;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return text || "Request failed";
}

export default function TimeRequestListPage() {
  const { isAuthenticated, authFetch } = useAuthToken();

  const [items, setItems] = useState<TimeRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      // ★バックエンドは触らない：既存の /api/time-requests を使う
      // admin の場合は「全員分が返る」実装になっている前提
      const res = await authFetch("/api/time-requests");
      if (!res.ok) throw new Error(pickMessage(await res.text()));

      const json = (await res.json()) as any;

      // ok(): { data: [...] } の可能性 / 生配列の両対応
      const list = (
        json && typeof json === "object" && "data" in json ? json.data : json
      ) as TimeRequest[];

      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(e?.message ?? "failed to load");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: number) {
    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`/api/admin/time-requests/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(pickMessage(await res.text()));
      await load();
    } catch (e: any) {
      setError(e?.message ?? "failed");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function reject(id: number) {
    const reason = window.prompt("却下理由を入力してください（必須）", "");
    if (!reason || reason.trim() === "") return;

    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`/api/admin/time-requests/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejected_reason: reason.trim() }),
      });
      if (!res.ok) throw new Error(pickMessage(await res.text()));
      await load();
    } catch (e: any) {
      setError(e?.message ?? "failed");
      await load();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  // pending だけ表示したいならフロントで絞る（バックエンドは触らない）
  const pendingOnly = items.filter((r) => r.status === "pending");

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-900">
            時刻修正申請一覧（pending）
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            件数:{" "}
            <span className="font-semibold text-slate-900">
              {pendingOnly.length}
            </span>
          </p>
        </div>

        <button
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "読み込み中..." : "再読込"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="text-xs font-semibold text-red-700">Error</div>
          <div className="mt-1 text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-200">
        <div className="grid grid-cols-12 gap-2 border-b bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
          <div className="col-span-1">ID</div>
          <div className="col-span-2">勤怠ID</div>
          <div className="col-span-3">申請出勤</div>
          <div className="col-span-3">申請退勤</div>
          <div className="col-span-3 text-right">操作</div>
        </div>

        {pendingOnly.length === 0 && !loading ? (
          <div className="px-4 py-4 text-sm text-slate-600">
            pending の申請はありません。
          </div>
        ) : (
          <div className="divide-y">
            {pendingOnly.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm"
              >
                <div className="col-span-1 font-medium text-slate-800">
                  {r.id}
                </div>

                <div className="col-span-2 text-slate-700">
                  {r.attendance_id}
                </div>

                <div className="col-span-3 text-slate-900">
                  {formatUtcToJst(r.requested_check_in_at)}
                </div>

                <div className="col-span-3 text-slate-900">
                  {r.requested_check_out_at
                    ? formatUtcToJst(r.requested_check_out_at)
                    : "—"}
                </div>

                <div className="col-span-3 flex justify-end gap-2">
                  <button
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => void approve(r.id)}
                    disabled={loading}
                  >
                    承認
                  </button>

                  <button
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                    onClick={() => void reject(r.id)}
                    disabled={loading}
                  >
                    却下
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="px-4 py-3 text-sm text-slate-600">読み込み中...</div>
        )}
      </div>
    </div>
  );
}
