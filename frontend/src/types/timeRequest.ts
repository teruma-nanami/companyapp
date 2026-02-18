// src/types/timeRequest.ts

export type TimeRequestStatus = "pending" | "approved" | "rejected";

export type TimeRequest = {
  id: number;

  user_id: number;
  attendance_id: number;

  // Laravel(CarbonImmutable) が JSON 化した文字列が来る想定（例: "2026-02-18T00:00:00.000000Z"）
  requested_check_in_at: string;
  requested_check_out_at: string | null;

  reason: string;

  status: TimeRequestStatus;
  rejected_reason: string | null;

  created_at: string;
  updated_at: string;
};
