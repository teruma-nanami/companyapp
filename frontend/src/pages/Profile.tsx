// src/pages/Profile.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import type { ApiEnvelope } from "../types/api";
import type { User } from "../types/user";

export default function Profile() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!isAuthenticated) {
      setError("ログインが必要です（/api/profile は認証必須）");
      setMe(null);
      return;
    }

    setLoading(true);
    setError("");

    getAccessTokenSilently()
      .then((token) => {
        return fetch("/api/profile", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(t || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((json: ApiEnvelope<User> | User) => {
        // ApiController の ok() は { data, message } 形式
        const user = (json as any)?.data ?? json;
        setMe(user as User);
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
        setMe(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold">プロフィール</h1>

        <div className="mt-3">
          <p className="text-sm">プロフィール表示はログインが必要です。</p>
          <button
            className="mt-2 rounded border px-3 py-1 text-sm"
            onClick={() => loginWithRedirect()}
          >
            ログイン
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm" style={{ color: "crimson" }}>
            Error: {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">プロフィール</h1>

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
        <table className="min-w-[700px] w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">key</th>
              <th className="p-2">value</th>
            </tr>
          </thead>
          <tbody>
            <Row k="email" v={me?.email} />
            <Row k="display_name" v={me?.display_name ?? "—"} />
            <Row k="role" v={me?.role} />
            {!me && !loading && !error && (
              <tr>
                <td className="p-2" colSpan={2}>
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

function Row({ k, v }: { k: string; v: any }) {
  return (
    <tr className="border-b">
      <td className="p-2">{k}</td>
      <td className="p-2">{v ?? "—"}</td>
    </tr>
  );
}
