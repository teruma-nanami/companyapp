// src/components/contacts/ContactModal.tsx
import { useEffect } from "react";
import { useContactDetails } from "../../hooks/contact/useContactDetails";
import type { Contact } from "../../types/contact";

type Props = {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onUpdated?: (updated: Contact) => void;
};

export default function ContactModal({
  open,
  contact,
  onClose,
  onUpdated,
}: Props) {
  const {
    status,
    assignedUserId,
    internalNote,
    saving,
    error,
    assignedOk,
    canSave,
    setStatus,
    setAssignedUserId,
    setInternalNote,
    resetFromContact,
    save,
  } = useContactDetails();

  useEffect(() => {
    if (!open || !contact) return;
    resetFromContact(contact);
  }, [open, contact, resetFromContact]);

  if (!open) return null;
  if (!contact) return null;

  function show(v: string | null | undefined): string {
    return v && String(v).trim() ? String(v) : "—";
  }

  function handleSave() {
    save(contact.id, (updated) => {
      onUpdated?.(updated);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40" />

      <div
        className="absolute left-1/2 top-1/2 w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-900/5 px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              お問い合わせ詳細
            </div>
            <div className="mt-1 text-xs text-slate-500">ID: {contact.id}</div>
          </div>

          <button
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            onClick={onClose}
            disabled={saving}
          >
            閉じる
          </button>
        </div>

        <div className="px-6 py-5">
          {/* 参照（誰が・どんな内容） */}
          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-900/10">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="text-[11px] font-semibold text-slate-600">
                  名前
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">
                  {show(contact.name)}
                </div>
              </div>

              <div className="col-span-6">
                <div className="text-[11px] font-semibold text-slate-600">
                  メール
                </div>
                <div className="mt-1 break-words text-sm font-medium text-slate-900">
                  {show(contact.email)}
                </div>
              </div>

              <div className="col-span-8">
                <div className="text-[11px] font-semibold text-slate-600">
                  件名
                </div>
                <div className="mt-1 break-words text-sm font-medium text-slate-900">
                  {show(contact.subject)}
                </div>
              </div>

              <div className="col-span-4">
                <div className="text-[11px] font-semibold text-slate-600">
                  種別
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                    {show(contact.category)}
                  </span>
                </div>
              </div>

              <div className="col-span-12">
                <div className="text-[11px] font-semibold text-slate-600">
                  本文
                </div>
                <div className="mt-2 whitespace-pre-wrap rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-900/10">
                  {show(contact.message)}
                </div>
              </div>
            </div>
          </div>

          {/* 編集（状態/担当者/管理メモ） */}
          <div className="mt-5 grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <label className="block text-xs font-semibold text-slate-700">
                状態
              </label>
              <select
                className="mt-2 w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-900/10 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={saving}
              >
                <option value="new">new</option>
                <option value="open">open</option>
                <option value="closed">closed</option>
              </select>
            </div>

            <div className="col-span-4">
              <label className="block text-xs font-semibold text-slate-700">
                担当者ID
              </label>
              <input
                className="mt-2 w-full rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-900/10 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                disabled={saving}
              />
              {!assignedOk && (
                <div className="mt-1 text-xs text-red-600">
                  数字のみ（未割当は空）
                </div>
              )}
            </div>

            <div className="col-span-12">
              <label className="block text-xs font-semibold text-slate-700">
                管理メモ
              </label>
              <textarea
                className="mt-2 w-full resize-none rounded-xl bg-white px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-900/10 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                rows={5}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
              <div className="text-xs font-semibold text-red-700">Error</div>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-900/5 px-6 py-4">
          <button
            className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            onClick={onClose}
            disabled={saving}
          >
            キャンセル
          </button>

          <button
            className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={!canSave}
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
