// src/components/dateRequests/DateRequestListView.tsx
import type { DateRequest } from "../../types/dateRequest";
import { normalizeDateOnly } from "../../utils/normalize";

type Props = {
  items: DateRequest[];
  loading: boolean;
  error: string;

  onClickDetail: (item: DateRequest) => void;
};

function sessionLabel(v: string) {
  if (v === "full") return "終日";
  if (v === "am") return "午前";
  if (v === "pm") return "午後";
  return v;
}

function statusLabel(v: string) {
  if (v === "pending") return "申請中";
  if (v === "approved") return "承認";
  if (v === "rejected") return "却下";
  return v;
}

function statusBadgeClass(v: string) {
  if (v === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (v === "approved")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (v === "rejected") return "bg-rose-50 text-rose-700 ring-rose-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

export default function DateRequestListView(props: Props) {
  const { items, loading, error, onClickDetail } = props;

  const btnMiniGhost =
    "rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ring-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50";

  return (
    <section className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-end justify-between gap-2 px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">申請一覧</div>
          <div className="mt-1 text-xs text-slate-500">
            {loading ? "読み込み中..." : `${items.length} 件`}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mx-4 mb-3 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
          <div className="text-xs font-semibold text-red-700">Error</div>
          <div className="mt-0.5 text-sm text-red-700">{error}</div>
        </div>
      ) : null}

      <div className="px-4 pb-4">
        {/* 横スクロール禁止：min-w / overflow-auto を使わず、折り返しで収める */}
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-900/5">
          <table className="w-full table-fixed text-left text-sm">
            <thead>
              <tr className="border-b border-slate-900/5 bg-slate-50">
                <th className="w-[110px] p-2">start</th>
                <th className="w-[110px] p-2">end</th>
                <th className="w-[84px] p-2">session</th>
                <th className="w-[110px] p-2">status</th>

                <th className="w-[84px] p-2">action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((r) => {
                const st = String(r.status);

                return (
                  <tr key={r.id} className="border-b border-slate-900/5">
                    <td className="p-2 align-top whitespace-nowrap">
                      {normalizeDateOnly(r.start_date)}
                    </td>
                    <td className="p-2 align-top whitespace-nowrap">
                      {normalizeDateOnly(r.end_date)}
                    </td>
                    <td className="p-2 align-top whitespace-nowrap">
                      {sessionLabel(String(r.session))}
                    </td>

                    <td className="p-2 align-top">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusBadgeClass(
                          st,
                        )}`}
                      >
                        {statusLabel(st)}
                      </span>
                    </td>

                    <td className="p-2 align-top">
                      <button
                        className={btnMiniGhost}
                        onClick={() => onClickDetail(r)}
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                );
              })}

              {items.length === 0 && !loading && !error && (
                <tr>
                  <td className="p-3 text-sm text-slate-600" colSpan={8}>
                    データなし
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="mt-3 text-xs text-slate-500">読み込み中...</div>
        ) : null}
      </div>
    </section>
  );
}
