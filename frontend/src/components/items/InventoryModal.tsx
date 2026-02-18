// src/components/items/InventoryModal.tsx
import { useInventoryModal } from "../../hooks/item/useInventoryModal";
import type { InventoryItem } from "../../types/inventoryItem";
import type { InventoryTransactionType } from "../../types/inventoryTransaction";

type Props = {
  open: boolean;
  mode: "create" | "stock" | "delete";

  saving: boolean;
  error: string;

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

function titleByMode(mode: "create" | "stock" | "delete"): string {
  if (mode === "create") return "商品を追加";
  if (mode === "stock") return "在庫を増減";
  return "商品を削除";
}

export default function InventoryModal(props: Props) {
  const {
    open,
    mode,
    saving,
    error,
    item,
    onClose,
    onCreate,
    onStock,
    onDelete,
  } = props;

  const m = useInventoryModal({
    open,
    mode,
    saving,
    item,
    onClose,
    onCreate,
    onStock,
    onDelete,
  });

  if (!open) return null;

  const title = titleByMode(mode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={m.requestClose}
        aria-label="close overlay"
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-lg ring-1 ring-slate-900/10">
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <div className="text-base font-semibold text-slate-900">
              {title}
            </div>

            {mode === "stock" && item ? (
              <div className="mt-1 text-xs text-slate-600">
                対象: {item.name}（現在庫: {item.quantity}）
              </div>
            ) : null}

            {mode === "delete" && item ? (
              <div className="mt-1 text-xs text-slate-600">
                対象: {item.name}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            onClick={m.requestClose}
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {(error || m.localError) && (
          <div className="px-5">
            <div className="rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
              <div className="text-xs font-semibold text-red-700">Error</div>
              <div className="mt-0.5 text-sm text-red-700">
                {m.localError || error}
              </div>
            </div>
          </div>
        )}

        <div className="px-5 py-4">
          {mode === "create" ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-700">
                  sku（任意）
                </div>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={m.sku}
                  onChange={(e) => m.setSku(e.target.value)}
                  placeholder="例: ABC-001"
                  disabled={saving}
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700">
                  商品名（必須）
                </div>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={m.name}
                  onChange={(e) => m.setName(e.target.value)}
                  placeholder="例: ミネラルウォーター"
                  disabled={saving}
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700">
                  初期在庫
                </div>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={m.quantityStr}
                  onChange={(e) => m.setQuantityStr(e.target.value)}
                  inputMode="numeric"
                  disabled={saving}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={m.isActive}
                  onChange={(e) => m.setIsActive(e.target.checked)}
                  disabled={saving}
                />
                有効（is_active）
              </label>
            </div>
          ) : null}

          {mode === "stock" ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-700">種別</div>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={m.txType}
                  onChange={(e) => m.setTxType(e.target.value as "in" | "out")}
                  disabled={saving}
                >
                  <option value="in">入庫（増やす）</option>
                  <option value="out">出庫（減らす）</option>
                </select>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700">
                  数量（1以上）
                </div>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={m.txQtyStr}
                  onChange={(e) => m.setTxQtyStr(e.target.value)}
                  inputMode="numeric"
                  disabled={saving}
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700">
                  メモ（任意）
                </div>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                  value={m.txNote}
                  onChange={(e) => m.setTxNote(e.target.value)}
                  placeholder="例: 棚卸し調整"
                  disabled={saving}
                />
              </div>

              {!item ? (
                <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600 ring-1 ring-slate-900/5">
                  対象の商品が未選択です（親コンポーネントから item
                  を渡してください）
                </div>
              ) : null}
            </div>
          ) : null}

          {mode === "delete" ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700 ring-1 ring-slate-900/5">
                この商品を削除します。よろしいですか？
              </div>

              {!item ? (
                <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600 ring-1 ring-slate-900/5">
                  対象の商品が未選択です（親コンポーネントから item
                  を渡してください）
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            onClick={m.requestClose}
            disabled={saving}
          >
            キャンセル
          </button>

          {mode === "create" ? (
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={m.submitCreate}
              disabled={saving}
            >
              追加
            </button>
          ) : null}

          {mode === "stock" ? (
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={m.submitStock}
              disabled={saving || !item}
            >
              反映
            </button>
          ) : null}

          {mode === "delete" ? (
            <button
              type="button"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              onClick={m.submitDelete}
              disabled={saving || !item}
            >
              削除
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
