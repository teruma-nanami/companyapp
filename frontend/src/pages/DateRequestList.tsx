// src/pages/DateRequestList.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import type { DateRequest } from "../types/dateRequest";
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
 * ApiController の { data, message } 形式 / 生のJSON どっちでも受けられるようにする
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapData<T>(json: any): T {
  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }
  return json as T;
}

async function readErrorMessage(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "";
  const isJson = ct.includes("application/json");

  try {
    if (isJson) {
      const j = (await res.json()) as any;
      return (
        (typeof j?.message === "string" && j.message) ||
        `Request failed: ${res.status}`
      );
    }
    const t = await res.text();
    return t || `Request failed: ${res.status}`;
  } catch {
    return `Request failed: ${res.status}`;
  }
}

export default function DateRequestList() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [items, setItems] = useState<DateRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * ★ 全員の一覧を取るには、本来ここを admin 用の GET にする必要があります。
   * 例: "/api/admin/date-requests"
   *
   * 今はまず「動く形」でページを作るため、現状あるAPIを叩いています。
   */
  const LIST_URL = "/api/date-requests";

  function load() {
    if (!isAuthenticated) {
      setError("ログインが必要です。");
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    getAccessTokenSilently()
      .then((token) => {
        return fetch(LIST_URL, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readErrorMessage(res));
        return res.json();
      })
      .then((json) => {
        const data = unwrapData<unknown>(json);
        if (Array.isArray(data)) {
          setItems(data as DateRequest[]);
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

  function approve(id: number) {
    if (!isAuthenticated) {
      setError("ログインが必要です。");
      return;
    }

    setError("");

    getAccessTokenSilently()
      .then((token) => {
        return fetch(`/api/admin/date-requests/${id}/approve`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readErrorMessage(res));

        // 返却があれば反映。なければ一覧を再読込。
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          const updated = unwrapData<DateRequest>(json);

          setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
        } else {
          load();
        }
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to approve");
      });
  }

  function reject(id: number) {
    if (!isAuthenticated) {
      setError("ログインが必要です。");
      return;
    }

    const reason =
      window.prompt("却下理由を入力してください（空でも可）", "") ?? "";

    setError("");

    getAccessTokenSilently()
      .then((token) => {
        return fetch(`/api/admin/date-requests/${id}/reject`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rejected_reason: reason,
          }),
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readErrorMessage(res));

        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          const updated = unwrapData<DateRequest>(json);

          setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
        } else {
          load();
        }
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to reject");
      });
  }

  useEffect(() => {
    if (isAuthenticated) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold">休日申請（管理）</h1>

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
      <h1 className="text-lg font-bold">休日申請（管理）</h1>

      <div className="mt-3">
        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={load}
          disabled={loading}
        >
          {loading ? "読み込み中..." : "再読込"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm" style={{ color: "crimson" }}>
          Error: {error}
        </p>
      )}

      <div className="mt-4 overflow-auto rounded border bg-white">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">id</th>
              <th className="p-2">user_id</th>
              <th className="p-2">start</th>
              <th className="p-2">end</th>
              <th className="p-2">session</th>
              <th className="p-2">status</th>
              <th className="p-2">reason</th>
              <th className="p-2">rejected_reason</th>
              <th className="p-2">created_at</th>
              <th className="p-2">action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((r) => {
              const isPending = String(r.status) === "pending";

              return (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.user_id}</td>
                  <td className="p-2">{normalizeDateOnly(r.start_date)}</td>
                  <td className="p-2">{normalizeDateOnly(r.end_date)}</td>
                  <td className="p-2">{sessionLabel(String(r.session))}</td>
                  <td className="p-2">{statusLabel(String(r.status))}</td>
                  <td className="p-2">{r.reason}</td>
                  <td className="p-2">
                    {showOrDash((r.rejected_reason ?? "").trim())}
                  </td>
                  <td className="p-2">{normalizeDateOnly(r.created_at)}</td>
                  <td className="p-2">
                    {isPending ? (
                      <div className="flex gap-2">
                        <button
                          className="rounded border px-2 py-1 text-xs"
                          onClick={() => approve(r.id)}
                        >
                          承認
                        </button>
                        <button
                          className="rounded border px-2 py-1 text-xs"
                          onClick={() => reject(r.id)}
                        >
                          却下
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && !loading && !error && (
              <tr>
                <td className="p-2" colSpan={10}>
                  データなし
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-600">
        ※ 全員分の一覧は、バックエンドに admin 用の GET が用意できたら{" "}
        <code>LIST_URL</code> を差し替えるだけで切り替えできます。
      </p>
    </div>
  );
}
