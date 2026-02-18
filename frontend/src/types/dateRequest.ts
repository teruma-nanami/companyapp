// src/types/dateRequest.ts
export type DateRequestSession = "full" | "am" | "pm";
export type DateRequestStatus = "pending" | "approved" | "rejected";

export type DateRequest = {
  id: number;
  user_id: number;
  start_date: string; // "YYYY-MM-DD" に寄せる（フロント側で正規化）
  end_date: string; // "YYYY-MM-DD" に寄せる（フロント側で正規化）
  session: DateRequestSession;
  reason: string;
  status: DateRequestStatus;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
};
