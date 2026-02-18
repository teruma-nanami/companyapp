// src/types/task.ts
export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: number;
  auth0_user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null; // "YYYY-MM-DD"（Laravel casts: date 想定）
  created_at: string;
  updated_at: string;
};
