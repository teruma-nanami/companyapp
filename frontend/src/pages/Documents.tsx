// src/pages/Documents.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuthToken } from "../hooks/useAuthToken";

function pickMessage(text: string): string {
  try {
    const obj = JSON.parse(text) as any;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return text || "Request failed";
}

function statusLabel(v: unknown): string {
  const s = String(v ?? "");
  if (s === "draft") return "下書き";
  if (s === "submitted") return "申請済み";
  return s || "—";
}

function badgeClass(v: unknown): string {
  const s = String(v ?? "");
  if (s === "draft") return "bg-slate-100 text-slate-700 ring-slate-200";
  if (s === "submitted")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-slate-50 text-slate-600 ring-slate-200";
}

function normalizeDoc(raw: any): any | null {
  if (!raw || typeof raw !== "object") return null;

  // 最低限: id, type, title, status が文字として表示できること
  const id = raw.id;
  if (typeof id !== "number") return null;

  return {
    id,
    user_id: raw.user_id ?? null,
    type: raw.type ?? "",
    title: raw.title ?? "",
    status: raw.status ?? "",
    document_data: raw.document_data ?? null,
    submitted_at: raw.submitted_at ?? null,
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
  };
}

export default function Documents() {
  const { isAuthenticated, authFetch } = useAuthToken();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const [error, setError] = useState("");

  // create form (最低限)
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [dataText, setDataText] = useState("{}");
  const [formError, setFormError] = useState("");

  const canInteract = isAuthenticated;

  const sorted = useMemo(() => {
    // backend: updated_at desc で返しているが、念のため
    return [...items].sort((a, b) => {
      const au = String(a?.updated_at ?? "");
      const bu = String(b?.updated_at ?? "");
      if (au === bu) return (b?.id ?? 0) - (a?.id ?? 0);
      return bu.localeCompare(au);
    });
  }, [items]);

  function load(): void {
    if (!canInteract) {
      setItems([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    authFetch("/api/documents", { method: "GET" })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) {
          const normalized = json
            .map((x) => normalizeDoc(x))
            .filter(Boolean) as any[];
          setItems(normalized);
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

  function parseDocumentData(): any | null {
    const t = String(dataText ?? "").trim();
    if (!t) return {};
    try {
      const v = JSON.parse(t);
      if (v && typeof v === "object") return v;
      return null;
    } catch {
      return null;
    }
  }

  function createDraft(): void {
    if (!canInteract) return;

    const t = String(type ?? "").trim();
    const ttl = String(title ?? "").trim();

    if (!t || !ttl) {
      setFormError("type / title は必須です。");
      return;
    }

    const dd = parseDocumentData();
    if (dd === null) {
      setFormError(
        "document_data は JSON として正しい形式で入力してください。",
      );
      return;
    }

    setCreating(true);
    setFormError("");
    setError("");

    authFetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: t,
        title: ttl,
        document_data: dd,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((tx) => {
            throw new Error(pickMessage(tx) || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((doc) => {
        const nd = normalizeDoc(doc);
        if (nd) {
          setItems((prev) => [nd, ...prev]);
        } else {
          // 想定外なら一覧再読込で安全に
          load();
        }

        // 入力は残しても良いが、初心者向けにクリア
        setType("");
        setTitle("");
        setDataText("{}");
      })
      .catch((e: any) => {
        setFormError(e?.message ?? "failed to create");
      })
      .finally(() => setCreating(false));
  }

  function submitDoc(id: number): void {
    if (!canInteract) return;

    setSubmittingId(id);
    setError("");

    authFetch(`/api/documents/${id}/submit`, { method: "POST" })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((tx) => {
            throw new Error(pickMessage(tx) || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((doc) => {
        const nd = normalizeDoc(doc);
        if (nd) {
          setItems((prev) => prev.map((x) => (x.id === id ? nd : x)));
        } else {
          load();
        }
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to submit");
      })
      .finally(() => setSubmittingId(null));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">書類（Documents）</h1>

      <div className="mt-3 rounded border bg-white p-3">
        <div className="text-sm font-semibold">下書き作成</div>

        <div className="mt-3 grid gap-3">
          <div>
            <div className="text-xs text-slate-600">type（必須）</div>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="例）vacation_form / expense / etc..."
              disabled={creating}
            />
          </div>

          <div>
            <div className="text-xs text-slate-600">title（必須）</div>
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例）2026年2月 休日申請"
              disabled={creating}
            />
          </div>

          <div>
            <div className="text-xs text-slate-600">
              document_data（JSON / 必須）
            </div>
            <textarea
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              rows={5}
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              disabled={creating}
            />
            <div className="mt-1 text-xs text-slate-500">
              まずは {"{}"} のままでもOKです（次フェーズでフォーム化します）。
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={createDraft}
              disabled={creating}
            >
              {creating ? "作成中..." : "下書きを作成"}
            </button>

            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={load}
              disabled={loading || creating || submittingId !== null}
            >
              {loading ? "読み込み中..." : "再読込"}
            </button>
          </div>

          {formError ? (
            <p className="text-sm" style={{ color: "crimson" }}>
              Form Error: {formError}
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm" style={{ color: "crimson" }}>
          Error: {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-auto rounded border bg-white">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">status</th>
              <th className="p-2">type</th>
              <th className="p-2">title</th>
              <th className="p-2">updated_at</th>
              <th className="p-2">action</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((d) => {
              const isDraft = String(d.status) === "draft";
              const busy = submittingId === d.id;

              return (
                <tr key={d.id} className="border-b">
                  <td className="p-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass(
                        d.status,
                      )}`}
                    >
                      {statusLabel(d.status)}
                    </span>
                  </td>
                  <td className="p-2">{String(d.type ?? "")}</td>
                  <td className="p-2">{String(d.title ?? "")}</td>
                  <td className="p-2">{String(d.updated_at ?? "—")}</td>
                  <td className="p-2">
                    {isDraft ? (
                      <button
                        className="rounded border px-2 py-1 text-xs"
                        onClick={() => submitDoc(d.id)}
                        disabled={busy || creating || loading}
                      >
                        {busy ? "申請中..." : "申請する"}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {sorted.length === 0 && !loading && !error ? (
              <tr>
                <td className="p-2" colSpan={5}>
                  データなし
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-xs text-slate-600">
        ※ PDF は現状 501（未実装）なので、この画面では扱いません。
      </div>
    </div>
  );
}
