// src/pages/Tasks.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import TaskModal from "../components/tasks/TaskModal";
import { useTaskModal } from "../hooks/task/useTaskModal";
import { useTasks } from "../hooks/task/useTasks";
import type { Task } from "../types/task";
import { normalizeDateOnly, showOrDash } from "../utils/normalize";

function statusLabel(s: Task["status"]): string {
  if (s === "todo") return "TODO";
  if (s === "in_progress") return "進行中";
  return "完了";
}

function badgeClass(s: Task["status"]): string {
  if (s === "todo") return "bg-slate-100 text-slate-700 ring-slate-200";
  if (s === "in_progress")
    return "bg-indigo-50 text-indigo-700 ring-indigo-200";
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
}

export default function Tasks() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const tasks = useTasks(isAuthenticated);

  const modal = useTaskModal({
    saving: tasks.saving,
    create: tasks.create,
  });

  useEffect(() => {
    tasks.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <h1 className="text-lg font-semibold text-slate-900">Tasks</h1>
          <p className="mt-2 text-sm text-slate-600">
            タスク一覧はログインが必要です。
          </p>

          <div className="mt-4">
            <button
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={() => loginWithRedirect()}
            >
              ログイン
            </button>
          </div>

          {tasks.error ? (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
              <div className="text-xs font-semibold text-red-700">Error</div>
              <div className="mt-0.5 text-sm text-red-700">{tasks.error}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const todo = tasks.items.filter((t) => t.status === "todo");
  const inProgress = tasks.items.filter((t) => t.status === "in_progress");
  const done = tasks.items.filter((t) => t.status === "done");

  const btnGhost =
    "rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50";
  const btnPrimary =
    "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50";
  const btnMini =
    "rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset disabled:opacity-50";
  const btnMiniGhost =
    "rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ring-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50";
  const btnMiniDanger =
    "rounded-md px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ring-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto w-full max-w-[1100px] space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Tasks
            </h1>
            <div className="mt-2 text-sm text-slate-600">
              追加はモーダルから。状態変更はカードのボタンで行います。
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={btnPrimary}
              onClick={modal.openCreateModal}
              disabled={tasks.saving}
            >
              追加
            </button>

            <button
              className={btnGhost}
              onClick={tasks.load}
              disabled={tasks.loading}
            >
              {tasks.loading ? "読み込み中..." : "再読込"}
            </button>
          </div>
        </div>

        {tasks.error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
            <div className="text-xs font-semibold text-red-700">Error</div>
            <div className="mt-0.5 text-sm text-red-700">{tasks.error}</div>
          </div>
        ) : null}

        <div className="gap-4">
          {/* TODO */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass(
                    "todo",
                  )}`}
                >
                  {statusLabel("todo")}
                </span>
                <span className="text-xs text-slate-500">{todo.length} 件</span>
              </div>
            </div>

            <div className="px-4 pb-4">
              {todo.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600 ring-1 ring-slate-900/5">
                  なし
                </div>
              ) : (
                <div className="divide-y divide-slate-900/5 overflow-hidden rounded-xl ring-1 ring-slate-900/5">
                  {todo.map((t) => (
                    <div key={t.id} className="bg-white px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {t.title}
                          </div>
                          {t.due_date ? (
                            <div className="mt-1 text-xs text-slate-500">
                              期限: {showOrDash(normalizeDateOnly(t.due_date))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            className={`${btnMini} bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100`}
                            disabled={tasks.saving}
                            onClick={() => tasks.updateStatus(t, "in_progress")}
                          >
                            進行中
                          </button>
                          <button
                            className={`${btnMini} bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100`}
                            disabled={tasks.saving}
                            onClick={() => tasks.updateStatus(t, "done")}
                          >
                            完了
                          </button>
                          <button
                            className={btnMiniDanger}
                            disabled={tasks.saving}
                            onClick={() => tasks.remove(t.id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>

                      {t.description ? (
                        <div className="mt-2 text-xs text-slate-600 line-clamp-2">
                          {t.description}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* in_progress */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass(
                    "in_progress",
                  )}`}
                >
                  {statusLabel("in_progress")}
                </span>
                <span className="text-xs text-slate-500">
                  {inProgress.length} 件
                </span>
              </div>
            </div>

            <div className="px-4 pb-4">
              {inProgress.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600 ring-1 ring-slate-900/5">
                  なし
                </div>
              ) : (
                <div className="divide-y divide-slate-900/5 overflow-hidden rounded-xl ring-1 ring-slate-900/5">
                  {inProgress.map((t) => (
                    <div key={t.id} className="bg-white px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {t.title}
                          </div>
                          {t.due_date ? (
                            <div className="mt-1 text-xs text-slate-500">
                              期限: {showOrDash(normalizeDateOnly(t.due_date))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            className={btnMiniGhost}
                            disabled={tasks.saving}
                            onClick={() => tasks.updateStatus(t, "todo")}
                          >
                            TODO
                          </button>
                          <button
                            className={`${btnMini} bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100`}
                            disabled={tasks.saving}
                            onClick={() => tasks.updateStatus(t, "done")}
                          >
                            完了
                          </button>
                          <button
                            className={btnMiniDanger}
                            disabled={tasks.saving}
                            onClick={() => tasks.remove(t.id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>

                      {t.description ? (
                        <div className="mt-2 text-xs text-slate-600 line-clamp-2">
                          {t.description}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* done */}
          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass(
                    "done",
                  )}`}
                >
                  {statusLabel("done")}
                </span>
                <span className="text-xs text-slate-500">{done.length} 件</span>
              </div>
            </div>

            <div className="px-4 pb-4">
              {done.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600 ring-1 ring-slate-900/5">
                  なし
                </div>
              ) : (
                <div className="divide-y divide-slate-900/5 overflow-hidden rounded-xl ring-1 ring-slate-900/5">
                  {done.map((t) => (
                    <div key={t.id} className="bg-white px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {t.title}
                          </div>
                          {t.due_date ? (
                            <div className="mt-1 text-xs text-slate-500">
                              期限: {showOrDash(normalizeDateOnly(t.due_date))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            className={btnMiniGhost}
                            disabled={tasks.saving}
                            onClick={() => tasks.updateStatus(t, "in_progress")}
                          >
                            進行中
                          </button>
                          <button
                            className={btnMiniGhost}
                            disabled={tasks.saving}
                            onClick={() => tasks.updateStatus(t, "todo")}
                          >
                            TODO
                          </button>
                          <button
                            className={btnMiniDanger}
                            disabled={tasks.saving}
                            onClick={() => tasks.remove(t.id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>

                      {t.description ? (
                        <div className="mt-2 text-xs text-slate-600 line-clamp-2">
                          {t.description}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <TaskModal
          open={modal.open}
          onClose={modal.closeCreateModal}
          saving={tasks.saving}
          error={modal.error}
          onSubmit={modal.submit}
        />
      </div>
    </div>
  );
}
