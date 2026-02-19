// src/pages/ContactList.tsx
import ContactListView from "../components/contacts/ContactListView";
import { useContactLists } from "../hooks/contact/useContactLists";

export default function ContactList() {
  const { isAuthenticated, loginWithRedirect, items, loading, error, load } =
    useContactLists();

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">お問い合わせ一覧（ContactList）</h1>

      {!isAuthenticated ? (
        <div className="mt-3">
          <p className="text-sm">一覧はログインが必要です。</p>
          <button
            className="mt-2 rounded border px-3 py-1 text-sm"
            onClick={() => loginWithRedirect()}
          >
            ログイン
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={load}
            disabled={loading}
          >
            {loading ? "読み込み中..." : "再読込"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm" style={{ color: "crimson" }}>
          Error: {error}
        </p>
      )}

      <ContactListView items={items} loading={loading} error={error} />
    </div>
  );
}
