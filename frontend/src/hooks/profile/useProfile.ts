// src/hooks/profile/useProfile.ts
import { useEffect, useState } from "react";
import type { User } from "../../types/user";
import { fetchJson } from "../../utils/http";
import { unwrapData } from "../../utils/unwrap";
import { useAuthToken } from "../useAuthToken";

export function useProfile() {
  const { isAuthenticated, loginWithRedirect, authFetch } = useAuthToken();

  const [me, setMe] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState("");

  // form
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  function applyUserToForm(user: User | null): void {
    setEmail(String(user?.email ?? ""));
    setDisplayName(String(user?.display_name ?? ""));
  }

  function clearAll(): void {
    setMe(null);
    applyUserToForm(null);
    setError("");
    setSaveError("");
    setSaveOk("");
  }

  function load(): void {
    if (!isAuthenticated) {
      setError("ログインが必要です（/api/profile は認証必須）");
      clearAll();
      return;
    }

    setLoading(true);
    setError("");
    setSaveError("");
    setSaveOk("");

    fetchJson(authFetch, "/api/profile", { method: "GET" })
      .then((json) => {
        const user = unwrapData<User | null>(json);
        const u =
          user && typeof user === "object" ? (user as User) : (null as null);

        setMe(u);
        applyUserToForm(u);
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
        clearAll();
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function canSave(): boolean {
    if (!me) return false;

    const e = email.trim();
    const d = displayName.trim();

    if (!e) return false;
    if (!d) return false;

    const changed =
      e !== String(me.email ?? "") || d !== String(me.display_name ?? "");
    return changed;
  }

  function save(): void {
    if (!isAuthenticated) {
      setSaveError("ログインが必要です。");
      return;
    }

    if (!me) {
      setSaveError("ユーザー情報がありません。再読込してください。");
      return;
    }

    const e = email.trim();
    const d = displayName.trim();

    if (!e || !d) {
      setSaveError("email / display_name は必須です。");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveOk("");
    setError("");

    fetchJson(authFetch, "/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: e,
        display_name: d,
      }),
    })
      .then((json) => {
        const user = unwrapData<User | null>(json);
        const u =
          user && typeof user === "object" ? (user as User) : (null as null);

        if (u) {
          setMe(u);
          applyUserToForm(u);
        }
        setSaveOk("保存しました。");
      })
      .catch((e: any) => {
        setSaveError(e?.message ?? "failed to save");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  useEffect(() => {
    if (!isAuthenticated) {
      clearAll();
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return {
    // auth
    isAuthenticated,
    loginWithRedirect,

    // data
    me,
    loading,
    saving,
    error,
    saveError,
    saveOk,

    // form
    email,
    setEmail,
    displayName,
    setDisplayName,

    // actions
    load,
    canSave,
    save,
  };
}
