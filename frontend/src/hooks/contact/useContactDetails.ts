// src/hooks/contacts/useContactDetails.ts
import { useState } from "react";
import type { Contact } from "../../types/contact";
import { useAuthToken } from "../useAuthToken";

export function useContactDetails() {
  const { authFetch } = useAuthToken();

  const [status, setStatus] = useState("");
  const [assignedUserId, setAssignedUserId] = useState(""); // 空なら未割当
  const [internalNote, setInternalNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function resetFromContact(contact: Contact) {
    setStatus(contact.status ?? "");
    setAssignedUserId(
      contact.assigned_user_id ? String(contact.assigned_user_id) : "",
    );
    setInternalNote(contact.internal_note ?? "");
    setSaving(false);
    setError("");
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
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(t || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((json) => {
        const updated = (
          json && typeof json === "object" && "data" in json
            ? (json as any).data
            : json
        ) as Contact;

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
