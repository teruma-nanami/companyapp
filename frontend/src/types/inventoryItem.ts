// src/types/inventoryItem.ts

/**
 * inventory_items テーブル（Laravel）
 *
 * - sku は nullable
 * - is_active は boolean
 * - created_at / updated_at は API で返る前提（文字列）
 */
export type InventoryItem = {
  id: number;
  sku: string | null;
  name: string;
  quantity: number;
  is_active: boolean;

  created_at: string;
  updated_at: string;
};
