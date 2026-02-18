// src/hooks/useTasks.ts
import { useState } from "react";
import type { Task } from "../../types/task";
import { useAuthToken } from "../useAuthToken";

type ApiEnvelope<T> = {
  data: T;
  message: string;
};

function pickMessage(text: string): string {
  try {
    const obj = JSON.parse(text) as any;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return text || "Request failed";
}

export function useTasks(isAuthenticated: boolean) {
  const { authFetch } = useAuthToken();

  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load(): void {
    if (!isAuthenticated) {
      setError("ログインが必要です（/api/tasks は認証必須）");
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    authFetch("/api/tasks", { method: "GET" })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
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

  function create(input: {
    title: string;
    description?: string;
    due_date?: string;
  }): Promise<void> {
    if (!isAuthenticated) return Promise.resolve();

    const payload: {
      title: string;
      description?: string;
      due_date?: string;
      status: string;
    } = {
      title: input.title,
      status: "todo",
    };

    const desc = String(input.description ?? "").trim();
    if (desc) payload.description = desc;

    if (input.due_date) payload.due_date = input.due_date;

    setSaving(true);
    setError("");

    return authFetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(() => {
        load();
      })
      .finally(() => {
        setSaving(false);
      });
  }

  // title required を回避するため PUT でも title を送る
  function updateStatus(task: Task, next: Task["status"]): Promise<void> {
    if (!isAuthenticated) return Promise.resolve();

    const payload = {
      title: task.title,
      description: task.description ?? null,
      due_date: task.due_date ?? null,
      status: next,
    };

    setSaving(true);
    setError("");

    return authFetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
          });
        }
        return res.json();
      })
      .then(() => {
        load();
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to update");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  function remove(taskId: number): Promise<void> {
    if (!isAuthenticated) return Promise.resolve();

    setSaving(true);
    setError("");

    return authFetch(`/api/tasks/${taskId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => {
            throw new Error(pickMessage(t) || `Request failed: ${res.status}`);
          });
        }
        return null;
      })
      .then(() => {
        load();
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to delete");
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return {
    items,
    loading,
    saving,
    error,
    setError,
    load,
    create,
    updateStatus,
    remove,
  };
}
