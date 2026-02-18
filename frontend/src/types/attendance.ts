// src/types/attendance.ts
export type Attendance = {
  id: number;

  // ★一覧で「自分の分だけ」を判定するために必要
  user_id: number;

  // 画面表示で使う想定（DBにある前提）
  work_date: string; // "YYYY-MM-DD"

  check_in_at: string | null;
  check_out_at: string | null;

  created_at: string; // ISO（例: 2026-01-29T10:47:40.000000Z）
  updated_at: string;
};
