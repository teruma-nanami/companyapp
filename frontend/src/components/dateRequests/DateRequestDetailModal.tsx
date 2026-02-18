// src/components/dateRequests/DateRequestDetailModal.tsx
import { useDateRequestDetailModal } from "../../hooks/request/useDateRequestDetailModal";
import type { DateRequest } from "../../types/dateRequest";
import { normalizeDateOnly, showOrDash } from "../../utils/normalize";

type Props = {
  open: boolean;
  saving: boolean;
  error: string;

  item: DateRequest | null;

  onClose: () => void;

  onApprove: (id: number) => void;
  onReject: (id: number, rejected_reason: string) => void;
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

export default function DateRequestDetailModal(props: Props) {
  const { open, saving, error, item, onClose, onApprove, onReject } = props;

  const m = useDateRequestDetailModal({
    open,
    saving,
    item,
    onClose,
    onApprove,
    onReject,
  });

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={m.requestClose}
        aria-label="close overlay"
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-lg ring-1 ring-slate-900/10">
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <div className="text-base font-semibold text-slate-900">
              休日申請（詳細）
            </div>
            <div className="mt-1 text-xs text-slate-600">
              申請内容を確認して、承認/却下します。
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
            <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-900/5">
              <div className="text-xs text-slate-500">申請ID</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">
                {item.id}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-900/5">
              <div className="text-xs text-slate-500">ユーザー</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">
                {item.user_id}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-900/5">
              <div className="text-xs text-slate-500">開始日</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">
                {normalizeDateOnly(item.start_date)}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-900/5">
              <div className="text-xs text-slate-500">終了日</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">
                {normalizeDateOnly(item.end_date)}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-900/5">
              <div className="text-xs text-slate-500">区分</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">
                {sessionLabel(String(item.session))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-900/5">
              <div className="text-xs text-slate-500">状態</div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">
                {statusLabel(String(item.status))}
              </div>
            </div>

            <div className="sm:col-span-2 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-900/5">
              <div className="text-xs text-slate-500">理由</div>
              <div className="mt-0.5 text-sm text-slate-900">
                {showOrDash(String(item.reason ?? "").trim())}
              </div>
            </div>

            <div className="sm:col-span-2 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-900/5">
              <div className="text-xs text-slate-500">却下理由</div>
              <div className="mt-0.5 text-sm text-slate-900">
                {showOrDash(String(item.rejected_reason ?? "").trim())}
              </div>
            </div>

            <div className="sm:col-span-2 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-900/10">
              <div className="text-xs font-semibold text-slate-700">
                却下理由（入力）
              </div>

              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:bg-slate-50"
                value={m.rejectedReason}
                onChange={(e) => m.setRejectedReason(e.target.value)}
                placeholder="空でも可（例）業務都合で不可"
                disabled={saving || !m.isPending}
              />

              <div className="mt-1 text-xs text-slate-500">
                ※ 申請中のときだけ操作できます。
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 pb-5">
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            onClick={m.requestClose}
            disabled={saving}
          >
            閉じる
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              onClick={m.clickApprove}
              disabled={saving || !m.isPending}
            >
              承認
            </button>

            <button
              type="button"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              onClick={m.clickReject}
              disabled={saving || !m.isPending}
            >
              却下
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
