// src/hooks/profile/useProfile.ts
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import type { ApiEnvelope } from "../../types/api";
import type { User } from "../../types/user";

function pickMessage(text: string): string {
  try {
    const obj = JSON.parse(text) as any;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return text || "Request failed";
}

function unwrapUser(json: ApiEnvelope<User> | User): User | null {
  const u = (json as any)?.data ?? json;
  if (!u || typeof u !== "object") return null;
  return u as User;
}

export function useProfile() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

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

  function load(): void {
    if (!isAuthenticated) {
      setError("ログインが必要です（/api/profile は認証必須）");
      setMe(null);
      applyUserToForm(null);
      return;
    }

    setLoading(true);
    setError("");
    setSaveError("");
    setSaveOk("");

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
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((json: ApiEnvelope<User> | User) => {
        const user = unwrapUser(json);
        setMe(user);
        applyUserToForm(user);
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
        setMe(null);
        applyUserToForm(null);
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

    getAccessTokenSilently()
      .then((token) => {
        return fetch("/api/profile", {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: e,
            display_name: d,
          }),
        });
      })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((json: ApiEnvelope<User> | User) => {
        const user = unwrapUser(json);
        if (user) {
          setMe(user);
          applyUserToForm(user);
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
