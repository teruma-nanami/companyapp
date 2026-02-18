// src/components/contacts/ContactListView.tsx
import { useContactLists } from "../../hooks/contact/useContactLists";
import type { Contact } from "../../types/contact";
import ContactModal from "./ContactModal";

type Props = {
  items: Contact[];
  loading: boolean;
  error: string;
};

export default function ContactListView({ items, loading, error }: Props) {
  const {
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
  } = useContactLists(items);

  return (
    <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            お問い合わせ一覧
          </h2>
          <div className="mt-0.5 text-xs text-slate-500">
            件数: <span className="font-semibold text-slate-900">{count}</span>
            {loading ? (
              <span className="ml-2 text-slate-500">読み込み中...</span>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div className="px-4 pb-3">
          <div className="rounded-xl bg-red-50 px-3 py-2 ring-1 ring-red-200">
            <div className="text-xs font-semibold text-red-700">Error</div>
            <div className="mt-0.5 text-sm text-red-700">{error}</div>
          </div>
        </div>
      ) : null}

      <div className="px-4 pb-4">
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-900/5">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="w-16 whitespace-nowrap px-3 py-2 text-xs font-semibold">
                  ID
                </th>
                <th className="w-[52%] whitespace-nowrap px-3 py-2 text-xs font-semibold">
                  件名
                </th>
                <th className="w-[7.5rem] whitespace-nowrap px-3 py-2 text-xs font-semibold">
                  種別
                </th>
                <th className="w-[7.5rem] whitespace-nowrap px-3 py-2 text-xs font-semibold">
                  状態
                </th>
                <th className="w-24 whitespace-nowrap px-3 py-2 text-right text-xs font-semibold">
                  操作
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-900/5">
              {viewItems.length === 0 && !loading && !error ? (
                <tr>
                  <td className="px-3 py-6 text-slate-600" colSpan={5}>
                    データなし
                  </td>
                </tr>
              ) : (
                viewItems.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                      {c.id}
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="truncate font-medium text-slate-900">
                        {c.subject}
                      </div>
                    </td>

                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass(
                          "category",
                          c.category,
                        )}`}
                      >
                        {categoryLabel(c.category)}
                      </span>
                    </td>

                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass(
                          "status",
                          c.status,
                        )}`}
                      >
                        {statusLabel(c.status)}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <button
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        onClick={() => openModal(c)}
                        disabled={loading}
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContactModal
        open={open}
        contact={selected}
        onClose={closeModal}
        onUpdated={applyUpdated}
      />
    </section>
  );
}
