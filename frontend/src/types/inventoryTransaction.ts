// src/types/inventoryTransaction.ts

/**
 * inventory_transactions テーブル（Laravel）
 *
 * Controller で with(['item', 'user']) しているので、
 * API では item / user が入ってくる前提。
 *
 * 初心者向けなので、user は「最低限」だけ型を置く。
 */
export type InventoryTransactionType = "in" | "out" | "adjust";

export type InventoryTransaction = {
  id: number;
  inventory_item_id: number;
  user_id: number | null;
  type: InventoryTransactionType;
  quantity: number;
  note: string | null;
  created_at: string; // ISO文字列（例: 2026-01-29T10:47:40.000000Z）
  updated_at: string;

  // with(['item','user']) の結果（無い可能性があるので optional）
  item?: { id: number; name: string; sku: string | null } | null;
  user?: { id: number; name?: string | null; email?: string | null } | null;
};

/**
 * フォーム送信用（入出庫）
 * - adjust は別用途想定なので、この画面では除外
 * - note は未入力なら送らない運用なので optional
 */
export type InventoryStockInput = {
  inventory_item_id: number;
  type: Exclude<InventoryTransactionType, "adjust">;
  quantity: number;
  note?: string;
};
