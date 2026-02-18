// src/hooks/request/useDateRequestList.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import type { DateRequest } from "../../types/dateRequest";

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

export function useDateRequestList() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [items, setItems] = useState<DateRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // detail modal
  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState<DateRequest | null>(null);
  const [modalError, setModalError] = useState("");

  /**
   * ★ 全員の一覧を取るには、本来ここを admin 用の GET にする必要があります。
   * 例: "/api/admin/date-requests"
   *
   * 今はまず「動く形」でページを作るため、現状あるAPIを叩いています。
   */
  const LIST_URL = "/api/date-requests";

  function openDetail(item: DateRequest): void {
    setModalError("");
    setSelected(item);
    setOpenModal(true);
  }

  function closeDetail(): void {
    if (saving) return;
    setOpenModal(false);
    setSelected(null);
    setModalError("");
  }

  function patchItem(id: number, updated: DateRequest): void {
    setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
    setSelected((prev) => (prev && prev.id === id ? updated : prev));
  }

  function load(): void {
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

  function approve(id: number): void {
    if (!isAuthenticated) {
      setError("ログインが必要です。");
      return;
    }

    setSaving(true);
    setError("");
    setModalError("");

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
          patchItem(id, updated);
        } else {
          load();
        }
      })
      .catch((e: any) => {
        const msg = e?.message ?? "failed to approve";
        setError(msg);
        setModalError(msg);
      })
      .finally(() => setSaving(false));
  }

  function reject(id: number, rejected_reason: string): void {
    if (!isAuthenticated) {
      setError("ログインが必要です。");
      return;
    }

    setSaving(true);
    setError("");
    setModalError("");

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
            rejected_reason: rejected_reason ?? "",
          }),
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readErrorMessage(res));

        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          const updated = unwrapData<DateRequest>(json);
          patchItem(id, updated);
        } else {
          load();
        }
      })
      .catch((e: any) => {
        const msg = e?.message ?? "failed to reject";
        setError(msg);
        setModalError(msg);
      })
      .finally(() => setSaving(false));
  }

  useEffect(() => {
    if (isAuthenticated) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return {
    // auth
    isAuthenticated,
    loginWithRedirect,

    // list
    items,
    loading,
    saving,
    error,
    load,

    // modal
    openModal,
    selected,
    modalError,
    openDetail,
    closeDetail,

    // actions
    approve,
    reject,
  };
}
