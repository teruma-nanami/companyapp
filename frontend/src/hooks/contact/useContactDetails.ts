// src/hooks/contacts/useContactDetails.ts
import { useState } from "react";
import type { Contact } from "../../types/contact";
import { readErrorMessage } from "../../utils/message";
import { unwrapData } from "../../utils/unwrap";
import { useAuthToken } from "../useAuthToken";

export function useContactDetails() {
  const { authFetch } = useAuthToken();
  const [status, setStatus] = useState("");
  const [assignedUserId, setAssignedUserId] = useState(""); // 空なら未割当
  const [internalNote, setInternalNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ★ フォーム初期化だけ（saving/error は触らない）
  function resetFromContact(contact: Contact) {
    setStatus(String(contact.status ?? ""));
    setAssignedUserId(
      contact.assigned_user_id ? String(contact.assigned_user_id) : "",
    );
    setInternalNote(String(contact.internal_note ?? ""));
  }

  function clearError() {
    setError("");
  }

  function isAssignedOk(value: string): boolean {
    const v = value.trim();
    if (v === "") return true;
    return /^\d+$/.test(v);
  }

  function canSaveNow(): boolean {
    if (saving) return false;
    if (status.trim() === "") return false;
    if (!isAssignedOk(assignedUserId)) return false;
    return true;
  }

  function save(contactId: number, onUpdated?: (updated: Contact) => void) {
    if (!canSaveNow()) return;

    setSaving(true);
    setError("");

    const assigned =
      assignedUserId.trim() === "" ? null : Number(assignedUserId.trim());

    authFetch(`/api/contacts/${contactId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: status.trim(),
        assigned_user_id: assigned,
        internal_note: internalNote,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await readErrorMessage(res));
        return (await res.json()) as unknown;
      })
      .then((json) => {
        const updated = unwrapData<Contact>(json);
        onUpdated?.(updated);
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return {
    status,
    assignedUserId,
    internalNote,
    saving,
    error,

    setStatus,
    setAssignedUserId,
    setInternalNote,

    resetFromContact,
    clearError,

    assignedOk: isAssignedOk(assignedUserId),
    canSave: canSaveNow(),

    save,
  };
}
