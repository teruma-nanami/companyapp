// src/hooks/item/useInventoryModal.ts
import { useEffect, useState } from "react";
import type { InventoryItem } from "../../types/inventoryItem";
import type { InventoryTransactionType } from "../../types/inventoryTransaction";

type Params = {
  open: boolean;
  mode: "create" | "stock" | "delete";
  saving: boolean;
  item?: InventoryItem | null;

  onClose: () => void;

  onCreate: (input: {
    sku?: string;
    name: string;
    quantity?: number;
    is_active?: boolean;
  }) => void;

  onStock: (input: {
    inventory_item_id: number;
    type: Exclude<InventoryTransactionType, "adjust">;
    quantity: number;
    note?: string;
  }) => void;

  onDelete: (itemId: number) => void;
};

export function useInventoryModal(params: Params) {
  const { open, mode, saving, item, onClose, onCreate, onStock, onDelete } =
    params;

  const [localError, setLocalError] = useState("");

  // create form
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [quantityStr, setQuantityStr] = useState("0");
  const [isActive, setIsActive] = useState(true);

  // stock form
  const [txType, setTxType] =
    useState<Exclude<InventoryTransactionType, "adjust">>("in");
  const [txQtyStr, setTxQtyStr] = useState("1");
  const [txNote, setTxNote] = useState("");

  useEffect(() => {
    if (!open) return;

    setLocalError("");

    if (mode === "create") {
      setSku("");
      setName("");
      setQuantityStr("0");
      setIsActive(true);
      return;
    }

    if (mode === "stock") {
      setTxType("in");
      setTxQtyStr("1");
      setTxNote("");
      return;
    }

    // delete
  }, [open, mode]);

  function requestClose(): void {
    if (saving) return;
    onClose();
  }

  function submitCreate(): void {
    setLocalError("");

    const trimmedName = String(name ?? "").trim();
    if (!trimmedName) {
      setLocalError("商品名は必須です");
      return;
    }

    const trimmedSku = String(sku ?? "").trim();
    const q = Number(quantityStr);

    if (!Number.isFinite(q) || q < 0) {
      setLocalError("在庫数は 0 以上の数値で入力してください");
      return;
    }

    onCreate({
      sku: trimmedSku ? trimmedSku : undefined,
      name: trimmedName,
      quantity: q === 0 ? undefined : Math.trunc(q),
      is_active: isActive,
    });
  }

  function submitStock(): void {
    setLocalError("");

    if (!item || typeof item.id !== "number") {
      setLocalError("対象の商品が選択されていません");
      return;
    }

    const q = Number(txQtyStr);
    if (!Number.isFinite(q) || q <= 0) {
      setLocalError("数量は 1 以上の数値で入力してください");
      return;
    }

    const note = String(txNote ?? "").trim();

    onStock({
      inventory_item_id: item.id,
      type: txType,
      quantity: Math.trunc(q),
      note: note ? note : undefined,
    });
  }

  function submitDelete(): void {
    setLocalError("");

    if (!item || typeof item.id !== "number") {
      setLocalError("対象の商品が選択されていません");
      return;
    }

    onDelete(item.id);
  }

  return {
    localError,

    sku,
    setSku,
    name,
    setName,
    quantityStr,
    setQuantityStr,
    isActive,
    setIsActive,

    txType,
    setTxType,
    txQtyStr,
    setTxQtyStr,
    txNote,
    setTxNote,

    requestClose,
    submitCreate,
    submitStock,
    submitDelete,
  };
}
