// src/pages/Tasks.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import type { Task } from "../types/task";
import { normalizeDateOnly, showOrDash } from "../utils/normalize";

type ApiEnvelope<T> = {
  data: T;
  message: string;
};

export default function Tasks() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // input[type=date]

  async function load() {
    if (!isAuthenticated) {
      setError("ログインが必要です（/api/tasks は認証必須）");
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    const token = await getAccessTokenSilently();

    fetch("/api/tasks", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(t || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then((json: ApiEnvelope<Task[]>) => {
        setItems(json?.data ?? []);
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function createTask() {
    if (!isAuthenticated) return;

    const t = title.trim();
    if (!t) {
      setError("タイトルは必須です");
      return;
    }

    setSaving(true);
    setError("");

    const token = await getAccessTokenSilently();

    const payload: {
      title: string;
      description?: string;
      due_date?: string;
      status?: string;
    } = {
      title: t,
      status: "todo",
    };

    const d = description.trim();
    if (d) payload.description = d;

    // due_date は "YYYY-MM-DD" をそのまま送る（Laravel casts: date）
    if (dueDate) payload.due_date = dueDate;

    fetch("/api/tasks", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t2) => {
            throw new Error(t2 || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(() => {
        setTitle("");
        setDescription("");
        setDueDate("");
        return load();
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to create");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  async function updateStatus(taskId: number, next: Task["status"]) {
    if (!isAuthenticated) return;

    setSaving(true);
    setError("");

    const token = await getAccessTokenSilently();

    fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: next }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(t || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(() => load())
      .catch((e: any) => {
        setError(e?.message ?? "failed to update");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  async function deleteTask(taskId: number) {
    if (!isAuthenticated) return;

    setSaving(true);
    setError("");

    const token = await getAccessTokenSilently();

    fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(t || `Request failed: ${res.status}`);
          });
        }
        return null;
      })
      .then(() => load())
      .catch((e: any) => {
        setError(e?.message ?? "failed to delete");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold">Tasks</h1>
        <p className="mt-2 text-sm">タスク一覧はログインが必要です。</p>
        <button
          className="mt-3 rounded border px-3 py-1 text-sm"
          onClick={() => loginWithRedirect()}
        >
          ログイン
        </button>
        {error && (
          <p className="mt-3 text-sm" style={{ color: "crimson" }}>
            Error: {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">Tasks（超シンプル）</h1>

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div>
          <div className="text-xs text-slate-600">title *</div>
          <input
            className="mt-1 w-64 rounded border px-2 py-1 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例）買い物に行く"
          />
        </div>

        <div>
          <div className="text-xs text-slate-600">description</div>
          <input
            className="mt-1 w-80 rounded border px-2 py-1 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="任意"
          />
        </div>

        <div>
          <div className="text-xs text-slate-600">due_date</div>
          <input
            className="mt-1 rounded border px-2 py-1 text-sm"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={createTask}
          disabled={saving}
        >
          {saving ? "処理中..." : "追加"}
        </button>

        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? "読み込み中..." : "再読込"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm" style={{ color: "crimson" }}>
          Error: {error}
        </p>
      )}

      <div className="mt-4 overflow-auto rounded border bg-white">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">id</th>
              <th className="p-2">title</th>
              <th className="p-2">status</th>
              <th className="p-2">due_date</th>
              <th className="p-2">actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.id}</td>
                <td className="p-2">
                  <div className="font-medium">{t.title}</div>
                  {t.description ? (
                    <div className="mt-1 text-xs text-slate-600">
                      {t.description}
                    </div>
                  ) : null}
                </td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">
                  {showOrDash(normalizeDateOnly(t.due_date))}
                </td>
                <td className="p-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      disabled={saving}
                      onClick={() => updateStatus(t.id, "todo")}
                    >
                      todo
                    </button>
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      disabled={saving}
                      onClick={() => updateStatus(t.id, "in_progress")}
                    >
                      in_progress
                    </button>
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      disabled={saving}
                      onClick={() => updateStatus(t.id, "done")}
                    >
                      done
                    </button>
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      disabled={saving}
                      onClick={() => deleteTask(t.id)}
                    >
                      delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && !loading && !error && (
              <tr>
                <td className="p-2" colSpan={5}>
                  データなし
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
