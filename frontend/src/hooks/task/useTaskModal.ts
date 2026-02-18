// src/hooks/useTaskModal.ts
import { useState } from "react";

export function useTaskModal(params: {
  saving: boolean;
  create: (input: {
    title: string;
    description?: string;
    due_date?: string;
  }) => Promise<void>;
}) {
  const { saving, create } = params;

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  function openCreateModal(): void {
    setError("");
    setOpen(true);
  }

  function closeCreateModal(): void {
    if (saving) return;
    setOpen(false);
    setError("");
  }

  function submit(input: {
    title: string;
    description?: string;
    due_date?: string;
  }): void {
    const title = String(input.title ?? "").trim();
    if (!title) {
      setError("タイトルは必須です");
      return;
    }

    setError("");

    create({
      title,
      description: input.description,
      due_date: input.due_date,
    })
      .then(() => {
        setOpen(false);
        setError("");
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to create");
      });
  }

  return {
    open,
    error,
    openCreateModal,
    closeCreateModal,
    submit,
  };
}
