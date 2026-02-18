// src/components/attendance/AttendanceView.tsx
import type { Attendance } from "../../types/attendance";
import type { BreakTime } from "../../types/breakTime";
import { formatUtcToJst } from "../../utils/time";

type Props = {
  today: Attendance | null;
  breaks: BreakTime[];
  loading: boolean;
  error: string;

  onReload: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onStartBreak: () => void;
  onEndBreak: () => void;

  canCheckIn: boolean;
  canCheckOut: boolean;
  canStartBreak: boolean;
  canEndBreak: boolean;
};

export default function AttendanceView({
  today,
  breaks,
  loading,
  error,
  onReload,
  onCheckIn,
  onCheckOut,
  onStartBreak,
  onEndBreak,
  canCheckIn,
  canCheckOut,
  canStartBreak,
  canEndBreak,
}: Props) {
  const statusKey = !today?.id
    ? "none"
    : today.check_out_at
      ? "checked_out"
      : breaks.some((b) => b.break_end_at === null)
        ? "on_break"
        : "working";

  const statusText =
    statusKey === "none"
      ? "未出勤"
      : statusKey === "checked_out"
        ? "退勤済み"
        : statusKey === "on_break"
          ? "休憩中"
          : "勤務中";

  const statusBadgeClass =
    statusKey === "none"
      ? "bg-slate-100 text-slate-700 ring-slate-200"
      : statusKey === "checked_out"
        ? "bg-slate-100 text-slate-700 ring-slate-200"
        : statusKey === "on_break"
          ? "bg-amber-50 text-amber-800 ring-amber-200"
          : "bg-blue-50 text-blue-800 ring-blue-200";

  const btnBase =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const btnGhost = `${btnBase} border bg-white text-slate-800 hover:bg-slate-50`;
  const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700`;
  const btnSoftBlue = `${btnBase} border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100`;

  return (
    <div className="bg-white from-slate-50 to-blue-50/40 p-6" bg-white-900>
      <div className="mx-auto w-full max-w-[980px] space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              勤怠
            </h1>

            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusBadgeClass}`}
              >
                {statusText}
              </span>

              <span className="text-sm text-slate-600">
                操作後は自動で最新状態に更新します
              </span>
            </div>
          </div>

          <button
            className={btnGhost}
            onClick={onReload}
            disabled={loading}
            title="一覧と今日の情報を再取得"
          >
            {loading ? "読み込み中..." : "再読込"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-7 p-4">
              <div className="text-sm font-semibold text-slate-900">
                今日の勤怠
              </div>

              <div className="mt-3">
                <table className="w-full table-fixed text-sm">
                  <thead className="text-slate-600">
                    <tr className="border-b">
                      <th className="py-2 pl-2 pr-2 text-left font-medium">
                        出勤
                      </th>
                      <th className="py-2 pl-2 pr-2 text-left font-medium">
                        退勤
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {!today ? (
                      <tr>
                        <td
                          className="py-4 pl-2 pr-2 text-slate-600"
                          colSpan={2}
                        >
                          データなし
                        </td>
                      </tr>
                    ) : (
                      <tr className="border-b last:border-b-0">
                        <td className="py-3 pl-2 pr-2 align-top text-slate-900">
                          {today.check_in_at
                            ? formatUtcToJst(today.check_in_at)
                            : "—"}
                        </td>
                        <td className="py-3 pl-2 pr-2 align-top text-slate-900">
                          {today.check_out_at
                            ? formatUtcToJst(today.check_out_at)
                            : "—"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-5 border-l border-slate-200/70 p-4">
              <div className="text-sm font-semibold text-slate-900">操作</div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className={btnPrimary}
                  onClick={onCheckIn}
                  disabled={loading || !canCheckIn}
                >
                  出勤
                </button>

                <button
                  className={btnPrimary}
                  onClick={onCheckOut}
                  disabled={loading || !canCheckOut}
                >
                  退勤
                </button>

                <button
                  className={btnSoftBlue}
                  onClick={onStartBreak}
                  disabled={loading || !canStartBreak}
                >
                  休憩開始
                </button>

                <button
                  className={btnSoftBlue}
                  onClick={onEndBreak}
                  disabled={loading || !canEndBreak}
                >
                  休憩終了
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                  <div className="text-xs font-semibold text-red-700">
                    Error
                  </div>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">休憩一覧</h2>
              <p className="mt-1 text-xs text-slate-600">
                時刻はすべて JST 表示に正規化しています
              </p>
            </div>

            <div className="text-xs text-slate-600">
              件数:{" "}
              <span className="font-semibold text-slate-900">
                {breaks.length}
              </span>
            </div>
          </div>

          <div className="px-4 py-4">
            <div className="grid grid-cols-12 px-3 py-2 text-xs font-semibold text-slate-700">
              <div className="col-span-5">開始</div>
              <div className="col-span-5">終了</div>
            </div>

            <div className="mt-2 divide-y  border-slate-200">
              {breaks.length === 0 ? (
                <div className="px-3 py-4 text-sm text-slate-600">
                  休憩はまだありません。
                </div>
              ) : (
                breaks.map((b) => (
                  <div
                    key={b.id}
                    className="grid grid-cols-12 items-center px-3 py-3 text-sm"
                  >
                    <div className="col-span-5 text-slate-900">
                      {formatUtcToJst(b.break_start_at)}
                    </div>

                    <div className="col-span-5 text-slate-900">
                      {b.break_end_at ? formatUtcToJst(b.break_end_at) : "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
