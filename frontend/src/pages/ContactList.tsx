// src/pages/ContactList.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import ContactListView from "../components/contacts/ContactListView";
import type { ApiEnvelope, Paginator } from "../types/api";
import type { Contact } from "../types/contact";

export default function ContactList() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function load() {
    if (!isAuthenticated) {
      setError("ログインが必要です（/api/contacts は認証必須）");
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    const token = await getAccessTokenSilently();

    fetch("/api/contacts", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(t || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((json: ApiEnvelope<Paginator<Contact>>) => {
        const list = json?.data?.data ?? [];
        setItems(list);
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">お問い合わせ一覧（ContactList）</h1>

      {!isAuthenticated && (
        <div className="mt-3">
          <p className="text-sm">一覧はログインが必要です。</p>
          <button
            className="mt-2 rounded border px-3 py-1 text-sm"
            onClick={() => loginWithRedirect()}
          >
            ログイン
          </button>
        </div>
      )}

      <div className="mt-3">
        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={() => void load()}
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

      <ContactListView items={items} loading={loading} error={error} />
    </div>
  );
}
