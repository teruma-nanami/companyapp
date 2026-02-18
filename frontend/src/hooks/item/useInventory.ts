// src/hooks/item/useInventory.ts
import { useEffect, useState } from "react";
import type { ApiEnvelope, Paginator } from "../../types/api";
import type { InventoryItem } from "../../types/inventoryItem";
import type {
  InventoryTransaction,
  InventoryTransactionType,
} from "../../types/inventoryTransaction";
import { useAuthToken } from "../useAuthToken";

function pickMessage(text: string): string {
  try {
    const obj = JSON.parse(text) as any;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return text || "Request failed";
}

export function useInventory() {
  const { isAuthenticated, loginWithRedirect, authFetch } = useAuthToken();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);

  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);

  const [errorItems, setErrorItems] = useState("");
  const [errorTx, setErrorTx] = useState("");

  // modal / saving
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "stock" | "delete">(
    "create",
  );
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  function loadItems(): void {
    if (!isAuthenticated) {
      setErrorItems("ログインが必要です（/api/items は認証必須）");
      setItems([]);
      return;
    }

    setLoadingItems(true);
    setErrorItems("");

    authFetch("/api/items", { method: "GET" })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
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

  function loadTransactions(): void {
    if (!isAuthenticated) {
      setErrorTx("ログインが必要です（/api/transactions は認証必須）");
      setTransactions([]);
      return;
    }

    setLoadingTx(true);
    setErrorTx("");

    authFetch("/api/transactions", { method: "GET" })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
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

  function openCreateModal(): void {
    setModalError("");
    setSelectedItem(null);
    setModalMode("create");
    setOpenModal(true);
  }

  function openStockModal(it: InventoryItem): void {
    setModalError("");
    setSelectedItem(it);
    setModalMode("stock");
    setOpenModal(true);
  }

  function openDeleteModal(it: InventoryItem): void {
    setModalError("");
    setSelectedItem(it);
    setModalMode("delete");
    setOpenModal(true);
  }

  function closeModal(): void {
    if (saving) return;
    setOpenModal(false);
    setModalError("");
  }

  function createItem(input: {
    sku?: string;
    name: string;
    quantity?: number;
    is_active?: boolean;
  }): void {
    if (!isAuthenticated) return;

    setSaving(true);
    setModalError("");
    setErrorItems("");

    const payload: any = {
      name: input.name,
    };

    const sku = String(input.sku ?? "").trim();
    if (sku) payload.sku = sku;

    if (typeof input.quantity === "number") payload.quantity = input.quantity;
    if (typeof input.is_active === "boolean")
      payload.is_active = input.is_active;

    authFetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(() => {
        setOpenModal(false);
        setModalError("");
        loadItems();
      })
      .catch((e: any) => {
        setModalError(e?.message ?? "failed to create");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  function createTransaction(input: {
    inventory_item_id: number;
    type: Exclude<InventoryTransactionType, "adjust">;
    quantity: number;
    note?: string;
  }): void {
    if (!isAuthenticated) return;

    setSaving(true);
    setModalError("");
    setErrorTx("");

    const payload: any = {
      inventory_item_id: input.inventory_item_id,
      type: input.type,
      quantity: input.quantity,
    };

    const note = String(input.note ?? "").trim();
    if (note) payload.note = note;

    authFetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(() => {
        setOpenModal(false);
        setModalError("");
        loadItems();
        loadTransactions();
      })
      .catch((e: any) => {
        setModalError(e?.message ?? "failed to stock");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  function deleteItem(itemId: number): void {
    if (!isAuthenticated) return;

    setSaving(true);
    setModalError("");
    setErrorItems("");

    authFetch(`/api/items/${itemId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
          });
        }
        return null;
      })
      .then(() => {
        setOpenModal(false);
        setModalError("");
        loadItems();
      })
      .catch((e: any) => {
        setModalError(e?.message ?? "failed to delete");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return {
    // auth
    isAuthenticated,
    loginWithRedirect,

    // data
    items,
    transactions,

    // loading & errors
    loadingItems,
    loadingTx,
    errorItems,
    errorTx,

    // reload
    loadItems,
    loadTransactions,

    // modal state
    openModal,
    modalMode,
    selectedItem,
    saving,
    modalError,

    // modal actions
    openCreateModal,
    openStockModal,
    openDeleteModal,
    closeModal,

    // mutations
    createItem,
    createTransaction,
    deleteItem,
  };
}
