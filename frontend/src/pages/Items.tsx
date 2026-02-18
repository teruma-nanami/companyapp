// src/pages/Items.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import type { ApiEnvelope, Paginator } from "../types/api";
import type { InventoryItem } from "../types/inventoryItem";
import type { InventoryTransaction } from "../types/inventoryTransaction";
import { formatUtcToJst } from "../utils/time";

export default function Items() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);

  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);

  const [errorItems, setErrorItems] = useState("");
  const [errorTx, setErrorTx] = useState("");

  function loadItems() {
    if (!isAuthenticated) {
      setErrorItems("ログインが必要です（/api/items は認証必須）");
      setItems([]);
      return;
    }

    setLoadingItems(true);
    setErrorItems("");

    getAccessTokenSilently()
      .then((token) => {
        return fetch("/api/items", {
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
      .then((json: ApiEnvelope<Paginator<InventoryItem>>) => {
        const list = json?.data?.data ?? [];
        setItems(list);
      })
      .catch((e: any) => {
        setErrorItems(e?.message ?? "failed to load");
        setItems([]);
      })
      .finally(() => {
        setLoadingItems(false);
      });
  }

  function loadTransactions() {
    if (!isAuthenticated) {
      setErrorTx("ログインが必要です（/api/transactions は認証必須）");
      setTransactions([]);
      return;
    }

    setLoadingTx(true);
    setErrorTx("");

    getAccessTokenSilently()
      .then((token) => {
        return fetch("/api/transactions", {
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
      .then((json: ApiEnvelope<Paginator<InventoryTransaction>>) => {
        const list = json?.data?.data ?? [];
        setTransactions(list);
      })
      .catch((e: any) => {
        setErrorTx(e?.message ?? "failed to load");
        setTransactions([]);
      })
      .finally(() => {
        setLoadingTx(false);
      });
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    loadItems();
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <p className="text-sm">在庫管理はログインが必要です。</p>
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
      <h1 className="text-lg font-bold">在庫管理（Items）</h1>

      <div className="mt-3 flex gap-2">
        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={loadItems}
          disabled={loadingItems}
        >
          {loadingItems ? "在庫: 読み込み中..." : "在庫: 再読込"}
        </button>

        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={loadTransactions}
          disabled={loadingTx}
        >
          {loadingTx ? "履歴: 読み込み中..." : "履歴: 再読込"}
        </button>
      </div>

      {errorItems && (
        <p className="mt-3 text-sm" style={{ color: "crimson" }}>
          在庫 Error: {errorItems}
        </p>
      )}

      <div className="mt-4 overflow-auto rounded border bg-white">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">id</th>
              <th className="p-2">sku</th>
              <th className="p-2">name</th>
              <th className="p-2">quantity</th>
              <th className="p-2">is_active</th>
              <th className="p-2">created_at</th>
            </tr>
          </thead>

          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b">
                <td className="p-2">{it.id}</td>
                <td className="p-2">{it.sku ?? "—"}</td>
                <td className="p-2">{it.name}</td>
                <td className="p-2">{it.quantity}</td>
                <td className="p-2">{it.is_active ? "true" : "false"}</td>
                <td className="p-2">{formatUtcToJst(it.created_at)}</td>
              </tr>
            ))}

            {items.length === 0 && !loadingItems && !errorItems && (
              <tr>
                <td className="p-2" colSpan={6}>
                  データなし
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {errorTx && (
        <p className="mt-6 text-sm" style={{ color: "crimson" }}>
          履歴 Error: {errorTx}
        </p>
      )}

      <div className="mt-4 overflow-auto rounded border bg-white">
        <table className="min-w-[1000px] w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">id</th>
              <th className="p-2">type</th>
              <th className="p-2">quantity</th>
              <th className="p-2">item</th>
              <th className="p-2">note</th>
              <th className="p-2">created_at</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.id}</td>
                <td className="p-2">{t.type}</td>
                <td className="p-2">{t.quantity}</td>
                <td className="p-2">{t.item?.name ?? "—"}</td>
                <td className="p-2">{t.note ?? "—"}</td>
                <td className="p-2">{formatUtcToJst(t.created_at)}</td>
              </tr>
            ))}

            {transactions.length === 0 && !loadingTx && !errorTx && (
              <tr>
                <td className="p-2" colSpan={6}>
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
