// src/types/inventoryItem.ts
export type InventoryItem = {
  id: number;
  sku: string | null;
  name: string;
  quantity: number;
  is_active: boolean;
  created_at: string; // ISO文字列（例: 2026-01-29T10:47:40.000000Z）
  updated_at: string;
};
