// src/hooks/contact/useContactListView.ts
import { useEffect, useState } from "react";
import type { Contact } from "../../types/contact";

/**
 * ContactListView用（表示側の状態：モーダル/選択/更新反映）
 * ※ 取得はしない
 */
export function useContactListView(items: Contact[]) {
  const [viewItems, setViewItems] = useState<Contact[]>(items ?? []);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => {
    setViewItems(items ?? []);
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
    setSelected((prev) => (prev && prev.id === updated.id ? updated : prev));
  }

  return {
    viewItems,

    open,
    selected,
    openModal,
    closeModal,
    applyUpdated,
  };
}
