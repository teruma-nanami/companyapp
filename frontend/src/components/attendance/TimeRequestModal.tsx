// src/components/attendance/TimeRequestModal.tsx
import { useEffect, useState } from "react";
import { useTimeRequests } from "../../hooks/request/useTimeRequests";
import type { Attendance } from "../../types/attendance";
import { formatUtcToJst } from "../../utils/time";

type Props = {
  open: boolean;
  attendance: Pick<Attendance, "id" | "check_in_at" | "check_out_at"> | null;
  onClose: () => void;

  // 申請成功後に「一覧を再取得」したい時に使う（呼び出し元で任意）
  onSubmitted?: () => void;
};

function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function datetimeLocalToIso(value: string): string {
  // "2026-02-18T09:30" をローカル時刻として解釈 -> ISO(UTC) に変換
  return new Date(value).toISOString();
}

export default function TimeRequestModal({
  open,
  attendance,
  onClose,
  onSubmitted,
}: Props) {
  const { create, loading, error } = useTimeRequests();

  const [inLocal, setInLocal] = useState("");
  const [outLocal, setOutLocal] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open || !attendance) return;

    setInLocal(isoToDatetimeLocal(attendance.check_in_at));
    setOutLocal(isoToDatetimeLocal(attendance.check_out_at));
    setReason("");
  }, [open, attendance]);

  if (!open) return null;
  if (!attendance) return null;

  function handleSubmit(): void {
    if (!inLocal) return;

    const requestedCheckInIso = datetimeLocalToIso(inLocal);
    const requestedCheckOutIso = outLocal ? datetimeLocalToIso(outLocal) : null;

    create({
      attendanceId: attendance.id,
      requested_check_in_at: requestedCheckInIso,
      requested_check_out_at: requestedCheckOutIso,
      reason: reason.trim(),
    }).then((created) => {
      if (!created) return;
      onClose();
      onSubmitted?.();
    });
  }

  const canSubmit = !!inLocal && !loading;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      {/* panel */}
      <div className="absolute left-1/2 top-1/2 w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              時刻修正申請
            </div>
            <div className="mt-1 text-xs text-slate-600">
              attendance_id: {attendance.id}
            </div>
          </div>

          <button
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={onClose}
            disabled={loading}
          >
            閉じる
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-3 text-slate-600">現在の出勤</div>
              <div className="col-span-9 font-medium text-slate-900">
                {attendance.check_in_at
                  ? formatUtcToJst(attendance.check_in_at)
                  : "—"}
              </div>

              <div className="col-span-3 text-slate-600">現在の退勤</div>
              <div className="col-span-9 font-medium text-slate-900">
                {attendance.check_out_at
                  ? formatUtcToJst(attendance.check_out_at)
                  : "—"}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-xs font-semibold text-slate-700">
                申請する出勤時刻（必須）
              </label>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                type="datetime-local"
                value={inLocal}
                onChange={(e) => setInLocal(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="col-span-6">
              <label className="block text-xs font-semibold text-slate-700">
                申請する退勤時刻（任意）
              </label>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                type="datetime-local"
                value={outLocal}
                onChange={(e) => setOutLocal(e.target.value)}
                disabled={loading}
              />
              <div className="mt-1 text-xs text-slate-500">
                退勤を空にすると「未退勤」のまま申請します
              </div>
            </div>

            <div className="col-span-12">
              <label className="block text-xs font-semibold text-slate-700">
                理由（任意）
              </label>
              <textarea
                className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="text-xs font-semibold text-red-700">Error</div>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            キャンセル
          </button>

          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? "送信中..." : "申請する"}
          </button>
        </div>
      </div>
    </div>
  );
}
