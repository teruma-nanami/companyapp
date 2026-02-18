// src/types/breakTime.ts

export type BreakTime = {
  id: number;
  attendance_id: number;
  break_start_at: string; // ISO想定（例: "2026-02-18T01:23:45.000000Z"）
  break_end_at: string | null;

  // timestamps（Laravelの標準。返ってくるなら使えるように型だけ持つ）
  created_at?: string;
  updated_at?: string;
};
