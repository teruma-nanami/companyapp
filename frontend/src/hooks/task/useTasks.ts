// src/hooks/useTasks.ts
import { useState } from "react";
import type { Task } from "../../types/task";
import { fetchJson, fetchNoContent } from "../../utils/http";
import { unwrapArray } from "../../utils/unwrap";
import { useAuthToken } from "../useAuthToken";

export function useTasks(isAuthenticated: boolean) {
  const { authFetch } = useAuthToken();

  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function clear(): void {
    setItems([]);
    setError("");
  }

  function load(): void {
    if (!isAuthenticated) {
      setError("ログインが必要です（/api/tasks は認証必須）");
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");

    fetchJson(authFetch, "/api/tasks", { method: "GET" })
      .then((json) => {
        // ApiController形式 { data, message } でも、生配列でも吸収
        const list = unwrapArray<Task>(json);
        setItems(list);
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
      status: Task["status"];
    } = {
      title: String(input.title ?? "").trim(),
      status: "todo",
    };

    const desc = String(input.description ?? "").trim();
    if (desc) payload.description = desc;

    if (input.due_date) payload.due_date = input.due_date;

    if (!payload.title) {
      setError("タイトルは必須です。");
      return Promise.resolve();
    }

    setSaving(true);
    setError("");

    return fetchJson(authFetch, "/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(() => {
        load();
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to create");
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

    return fetchJson(authFetch, `/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

    return fetchNoContent(authFetch, `/api/tasks/${taskId}`, {
      method: "DELETE",
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

    clear,
    load,
    create,
    updateStatus,
    remove,
  };
}
