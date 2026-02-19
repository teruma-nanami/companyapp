// src/hooks/contact/useContactLists.ts
import { useEffect, useState } from "react";
import type { Contact } from "../../types/contact";
import { fetchJson } from "../../utils/http";
import { unwrapData } from "../../utils/unwrap";
import { useAuthToken } from "../useAuthToken";

/**
 * 取得結果の吸収（paginate / ok形式 / 生）
 * - paginate: { data: { data: [...] } }
 * - ok形式: { data: [...] }
 * - 生: [...]
 */
function unwrapContacts(json: unknown): Contact[] {
  const data = unwrapData<unknown>(json);

  // paginate: data が object で inner.data が配列
  if (data && typeof data === "object" && "data" in (data as any)) {
    const inner = (data as any).data;
    if (Array.isArray(inner)) return inner as Contact[];
  }

  // ok形式 or 生配列
  return Array.isArray(data) ? (data as Contact[]) : [];
}

/**
 * ContactListページ用（一覧取得）
 */
export function useContactLists() {
  const { isAuthenticated, loginWithRedirect, authFetch } = useAuthToken();

  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function clear() {
    setItems([]);
    setError("");
  }

  function load() {
    if (!isAuthenticated) {
      setError("ログインが必要です（/api/contacts は認証必須）");
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    fetchJson(authFetch, "/api/contacts", { method: "GET" })
      .then((json) => {
        setItems(unwrapContacts(json));
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
    if (!isAuthenticated) {
      clear();
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    loginWithRedirect,

    items,
    loading,
    error,

    load,
    clear,
  };
}
