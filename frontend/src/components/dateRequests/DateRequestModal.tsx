// src/components/dateRequests/DateRequestModal.tsx
import { useDateRequestModal } from "../../hooks/request/useDateRequestModal";
import type { DateRequestSession } from "../../types/dateRequest";

type Props = {
  open: boolean;
  saving: boolean;
  error: string;

  onClose: () => void;

  onSubmit: (input: {
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    session: DateRequestSession;
    reason: string;
  }) => void;
};

function sessionLabel(v: DateRequestSession): string {
  if (v === "full") return "終日";
  if (v === "am") return "午前";
  if (v === "pm") return "午後";
  return v;
}

export default function DateRequestModal(props: Props) {
  const { open, saving, error, onClose, onSubmit } = props;

  const m = useDateRequestModal({
    open,
    saving,
    onClose,
    onSubmit,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={m.requestClose}
        aria-label="close overlay"
      />

      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-lg ring-1 ring-slate-900/10">
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <div className="text-base font-semibold text-slate-900">
              休日申請
            </div>
            <div className="mt-1 text-xs text-slate-600">
              期間・区分・理由を入力して申請します。
            </div>
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-slate-700">開始日</div>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                type="date"
                value={m.startDate}
                onChange={(e) => m.setStartDate(e.target.value)}
                disabled={saving}
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700">終了日</div>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                type="date"
                value={m.endDate}
                onChange={(e) => m.setEndDate(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs font-semibold text-slate-700">区分</div>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={m.session}
                onChange={(e) =>
                  m.setSession(e.target.value as DateRequestSession)
                }
                disabled={saving}
              >
                <option value="full">{sessionLabel("full")}</option>
                <option value="am">{sessionLabel("am")}</option>
                <option value="pm">{sessionLabel("pm")}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs font-semibold text-slate-700">理由</div>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={m.reason}
                onChange={(e) => m.setReason(e.target.value)}
                placeholder="例）私用のため"
                disabled={saving}
              />
            </div>
          </div>
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

          <button
            type="button"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={m.submit}
            disabled={saving}
          >
            {saving ? "送信中..." : "申請する"}
          </button>
        </div>
      </div>
    </div>
  );
}
