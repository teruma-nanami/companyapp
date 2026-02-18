// src/hooks/contacts/useContactLists.ts
import { useEffect, useMemo, useState } from "react";
import type { Contact } from "../../types/contact";

type BadgeKind = "category" | "status";

export function useContactLists(items: Contact[]) {
  const [viewItems, setViewItems] = useState<Contact[]>(items);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    setViewItems(items);
  }, [items]);

  function openModal(contact: Contact) {
    setSelected(contact);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setSelected(null);
  }

  function applyUpdated(updated: Contact) {
    setViewItems((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
    setSelected(updated);
  }

  function categoryLabel(category: string): string {
    if (category === "bug") return "不具合";
    if (category === "request") return "要望";
    if (category === "other") return "その他";
    return category;
  }

  function statusLabel(status: string): string {
    if (status === "new") return "新規";
    if (status === "open") return "対応中";
    if (status === "closed") return "完了";
    return status;
  }

  function badgeClass(kind: BadgeKind, value: string): string {
    if (kind === "category") {
      if (value === "bug") return "bg-red-50 text-red-700 ring-red-200";
      if (value === "request") return "bg-blue-50 text-blue-700 ring-blue-200";
      return "bg-slate-100 text-slate-700 ring-slate-200";
    }

    if (value === "new") return "bg-amber-50 text-amber-700 ring-amber-200";
    if (value === "open") return "bg-indigo-50 text-indigo-700 ring-indigo-200";
    if (value === "closed")
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  const count = useMemo(() => viewItems.length, [viewItems]);

  return {
    viewItems,
    count,

    open,
    selected,
    openModal,
    closeModal,
    applyUpdated,

    categoryLabel,
    statusLabel,
    badgeClass,
  };
}
