// src/components/attendance/AttendanceListView.tsx
import type { Attendance } from "../../types/attendance";
import { formatUtcToJst } from "../../utils/time";

type Props = {
  items: Attendance[];
  loading: boolean;
  error: string;

  page: number;
  lastPage: number;
  total: number;

  onReload: () => void;
  onGoPage: (p: number) => void;

  onOpenTimeRequest: (attendance: Attendance) => void;
};

function showTime(iso: string | null): string {
  return iso ? formatUtcToJst(iso) : "—";
}

export default function AttendanceListView({
  items,
  loading,
  error,
  page,
  lastPage,
  total,
  onReload,
  onGoPage,
  onOpenTimeRequest,
}: Props) {
  const canPrev = page > 1 && !loading;
  const canNext = page < lastPage && !loading;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">勤怠一覧</h2>
          <p className="mt-1 text-xs text-slate-600">
            件数: <span className="font-semibold text-slate-900">{total}</span>
            ／ページ:{" "}
            <span className="font-semibold text-slate-900">
              {page}/{lastPage || 1}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
            onClick={onReload}
            disabled={loading}
          >
            {loading ? "読み込み中..." : "再読込"}
          </button>

          <button
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
            onClick={() => onGoPage(page - 1)}
            disabled={!canPrev}
          >
            前へ
          </button>

          <button
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
            onClick={() => onGoPage(page + 1)}
            disabled={!canNext}
          >
            次へ
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="text-xs font-semibold text-red-700">Error</div>
            <div className="mt-1 text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      <div className="px-6 py-4">
        {/* テーブルを避けて、横スクロールが出にくい“カード行”にする */}
        <div className="rounded-xl border border-slate-200">
          <div className="grid grid-cols-12 gap-2 border-b bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
            <div className="col-span-1">ID</div>
            <div className="col-span-4">出勤</div>
            <div className="col-span-4">退勤</div>
            <div className="col-span-3 text-right">操作</div>
          </div>

          {items.length === 0 && !loading ? (
            <div className="px-4 py-4 text-sm text-slate-600">
              データがありません。
            </div>
          ) : (
            <div className="divide-y">
              {items.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm"
                >
                  <div className="col-span-1 font-medium text-slate-800">
                    {a.id}
                  </div>

                  <div className="col-span-4 text-slate-900">
                    {showTime(a.check_in_at)}
                  </div>

                  <div className="col-span-4 text-slate-900">
                    {showTime(a.check_out_at)}
                  </div>

                  <div className="col-span-3 flex justify-end">
                    <button
                      className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-50"
                      onClick={() => onOpenTimeRequest(a)}
                      disabled={loading}
                      title="この勤怠の時刻修正を申請します"
                    >
                      修正申請
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-3 text-sm text-slate-600">読み込み中...</div>
        )}
      </div>
    </div>
  );
}
