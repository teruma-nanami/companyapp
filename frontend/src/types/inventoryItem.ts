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

/**
 * フォーム送信用（作成）
 * - APIへ送る形に合わせる（id/created_at 等は送らない）
 * - sku は「未入力なら送らない」運用なので optional
 * - quantity は 0 のとき送らない運用なので optional
 */
export type InventoryItemCreateInput = {
  sku?: string;
  name: string;
  quantity?: number;
  is_active?: boolean;
};
