// src/components/tasks/TaskModal.tsx
import { useEffect, useState } from "react";

type TaskCreateInput = {
  title: string;
  description?: string;
  due_date?: string; // "YYYY-MM-DD"
  status?: "todo";
};

type Props = {
  open: boolean;
  onClose: () => void;

  saving: boolean;
  error: string;

  onSubmit: (input: TaskCreateInput) => void;
};

function trimOrEmpty(v: string): string {
  return String(v ?? "").trim();
}

export default function TaskModal({
  open,
  onClose,
  saving,
  error,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // input[type=date]

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setDueDate("");
  }, [open]);

  if (!open) return null;

  const canSubmit = trimOrEmpty(title) !== "" && !saving;

  function handleSubmit() {
    const t = trimOrEmpty(title);
    if (!t) return;

    const d = trimOrEmpty(description);

    const payload: TaskCreateInput = {
      title: t,
      status: "todo",
    };

    if (d) payload.description = d;
    if (dueDate) payload.due_date = dueDate;

    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              タスク追加
            </div>
            <div className="mt-1 text-xs text-slate-500">
              追加後は一覧が更新されます
            </div>
          </div>

          <button
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            onClick={onClose}
            disabled={saving}
          >
            閉じる
          </button>
        </div>

        <div className="px-6 pb-6">
          {error ? (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
              <div className="text-xs font-semibold text-red-700">Error</div>
              <div className="mt-0.5 text-sm text-red-700">{error}</div>
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-700">
                タイトル（必須）
              </div>
              <input
                className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-900/10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700">
                詳細（任意）
              </div>
              <textarea
                className="mt-2 w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-900/10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-700">
                期限（任意）
              </div>
              <input
                className="mt-2 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-900 ring-1 ring-slate-900/10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-900/5 px-6 py-4">
          <button
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            onClick={onClose}
            disabled={saving}
          >
            キャンセル
          </button>

          <button
            className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {saving ? "送信中..." : "追加する"}
          </button>
        </div>
      </div>
    </div>
  );
}
