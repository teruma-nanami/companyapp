// src/pages/Items.tsx
import InventoryModal from "../components/items/InventoryModal";
import { useInventory } from "../hooks/item/useInventory";
import { formatUtcToJst } from "../utils/time";

export default function Items() {
  const inv = useInventory();

  // このページは「未ログインだとメニューに出ない」前提とのことなので、
  // ここではログイン誘導UIは出さず、念のため何も描画しないようにします。
  if (!inv.isAuthenticated) return null;

  const btnPrimary =
    "rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50";
  const btnGhost =
    "rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50";
  const btnMini =
    "rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ring-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto w-full max-w-[1100px] space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              在庫管理（Items）
            </h1>
            <div className="mt-2 text-sm text-slate-600">
              追加は「商品追加」から。在庫増減・削除は一覧の右端から行います。
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className={btnPrimary}
              onClick={inv.openCreateModal}
              disabled={inv.saving}
              aria-label="商品追加"
            >
              ＋ 商品追加
            </button>

            <button
              className={btnGhost}
              onClick={inv.loadItems}
              disabled={inv.loadingItems}
            >
              {inv.loadingItems ? "在庫: 読み込み中..." : "在庫: 再読込"}
            </button>

            <button
              className={btnGhost}
              onClick={inv.loadTransactions}
              disabled={inv.loadingTx}
            >
              {inv.loadingTx ? "履歴: 読み込み中..." : "履歴: 再読込"}
            </button>
          </div>
        </div>

        {inv.errorItems ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
            <div className="text-xs font-semibold text-red-700">在庫 Error</div>
            <div className="mt-0.5 text-sm text-red-700">{inv.errorItems}</div>
          </div>
        ) : null}

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">在庫一覧</div>
            <div className="text-xs text-slate-500">{inv.items.length} 件</div>
          </div>

          <div className="px-4 pb-4">
            {/* 横スクロールを出さない：min-width/overflow-auto をやめて table-fixed + 省略表示 */}
            <div className="rounded-xl ring-1 ring-slate-900/5">
              <table className="w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-900/5 bg-slate-50">
                    <th className="w-[64px] p-2">id</th>
                    <th className="hidden w-[120px] p-2 md:table-cell">sku</th>
                    <th className="p-2">name</th>
                    <th className="w-[96px] p-2">qty</th>
                    <th className="hidden w-[110px] p-2 sm:table-cell">
                      active
                    </th>
                    <th className="hidden w-[170px] p-2 lg:table-cell">
                      created
                    </th>
                    <th className="w-[140px] p-2">actions</th>
                  </tr>
                </thead>

                <tbody>
                  {inv.items.map((it) => (
                    <tr key={it.id} className="border-b border-slate-900/5">
                      <td className="p-2">{it.id}</td>

                      <td className="hidden p-2 md:table-cell">
                        <div className="truncate">{it.sku ?? "—"}</div>
                      </td>

                      <td className="p-2">
                        <div className="truncate">{it.name}</div>
                      </td>

                      <td className="p-2">{it.quantity}</td>

                      <td className="hidden p-2 sm:table-cell">
                        {it.is_active ? "true" : "false"}
                      </td>

                      <td className="hidden p-2 lg:table-cell">
                        <div className="truncate">
                          {formatUtcToJst(it.created_at)}
                        </div>
                      </td>

                      <td className="p-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className={btnMini}
                            onClick={() => inv.openStockModal(it)}
                            disabled={inv.saving}
                          >
                            在庫
                          </button>
                          <button
                            className={btnMini}
                            onClick={() => inv.openDeleteModal(it)}
                            disabled={inv.saving}
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {inv.items.length === 0 &&
                    !inv.loadingItems &&
                    !inv.errorItems && (
                      <tr>
                        <td className="p-2" colSpan={7}>
                          データなし
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {inv.errorTx ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
            <div className="text-xs font-semibold text-red-700">履歴 Error</div>
            <div className="mt-0.5 text-sm text-red-700">{inv.errorTx}</div>
          </div>
        ) : null}

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">取引履歴</div>
            <div className="text-xs text-slate-500">
              {inv.transactions.length} 件
            </div>
          </div>

          <div className="px-4 pb-4">
            {/* 横スクロールを出さない：重要列のみ常時表示、他は画面幅で隠す */}
            <div className="rounded-xl ring-1 ring-slate-900/5">
              <table className="w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-900/5 bg-slate-50">
                    <th className="w-[64px] p-2">id</th>
                    <th className="w-[84px] p-2">type</th>
                    <th className="w-[96px] p-2">qty</th>
                    <th className="p-2">item</th>
                    <th className="hidden p-2 md:table-cell">note</th>
                    <th className="hidden w-[170px] p-2 lg:table-cell">
                      created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {inv.transactions.map((t) => (
                    <tr key={t.id} className="border-b border-slate-900/5">
                      <td className="p-2">{t.id}</td>
                      <td className="p-2">{t.type}</td>
                      <td className="p-2">{t.quantity}</td>

                      <td className="p-2">
                        <div className="truncate">{t.item?.name ?? "—"}</div>
                      </td>

                      <td className="hidden p-2 md:table-cell">
                        <div className="truncate">{t.note ?? "—"}</div>
                      </td>

                      <td className="hidden p-2 lg:table-cell">
                        <div className="truncate">
                          {formatUtcToJst(t.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {inv.transactions.length === 0 &&
                    !inv.loadingTx &&
                    !inv.errorTx && (
                      <tr>
                        <td className="p-2" colSpan={6}>
                          データなし
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <InventoryModal
          open={inv.openModal}
          mode={inv.modalMode}
          saving={inv.saving}
          error={inv.modalError}
          item={inv.selectedItem}
          onClose={inv.closeModal}
          onCreate={inv.createItem}
          onStock={inv.createTransaction}
          onDelete={inv.deleteItem}
        />
      </div>
    </div>
  );
}
