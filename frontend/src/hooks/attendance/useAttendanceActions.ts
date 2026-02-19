// src/hooks/attendance/useAttendanceActions.ts
import { useState } from "react";
import type { Attendance } from "../../types/attendance";
import type { BreakTime } from "../../types/breakTime";
import { fetchJson } from "../../utils/http";
import { unwrapArray, unwrapData } from "../../utils/unwrap";
import { useAuthToken } from "../useAuthToken";

export function useAttendanceActions() {
  const { authFetch } = useAuthToken();

  const [today, setToday] = useState<Attendance | null>(null);
  const [breaks, setBreaks] = useState<BreakTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function reloadAll() {
    setLoading(true);
    setError("");

    return fetchJson(authFetch, "/api/attendances/today")
      .then((todayJson) => {
        const a = unwrapData<Attendance | null>(todayJson);
        setToday(a);

        if (!a?.id) {
          setBreaks([]);
          return;
        }

        return fetchJson(
          authFetch,
          `/api/attendances/${a.id}/break-times`,
        ).then((breaksJson) => {
          const list = unwrapArray<BreakTime>(breaksJson);
          setBreaks(list);
        });
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
        setToday(null);
        setBreaks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function checkIn() {
    setLoading(true);
    setError("");

    return fetchJson(authFetch, "/api/attendances/check-in", { method: "POST" })
      .then(() => reloadAll())
      .catch((e: any) => {
        setError(e?.message ?? "failed");
        return reloadAll();
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function checkOut() {
    setLoading(true);
    setError("");

    return fetchJson(authFetch, "/api/attendances/check-out", {
      method: "POST",
    })
      .then(() => reloadAll())
      .catch((e: any) => {
        setError(e?.message ?? "failed");
        return reloadAll();
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function startBreak() {
    if (!today?.id) {
      setError("先に出勤してください（今日の勤怠がありません）");
      return Promise.resolve();
    }

    setLoading(true);
    setError("");

    return fetchJson(authFetch, "/api/break-times/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendance_id: today.id,
        break_start_at: new Date().toISOString(),
      }),
    })
      .then(() => reloadAll())
      .catch((e: any) => {
        setError(e?.message ?? "failed");
        return reloadAll();
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function endBreak() {
    if (!today?.id) {
      setError("先に出勤してください（今日の勤怠がありません）");
      return Promise.resolve();
    }

    const active = breaks.find((b) => b.break_end_at === null) ?? null;
    if (!active) {
      setError("終了できる休憩がありません（休憩中ではない）");
      return Promise.resolve();
    }

    setLoading(true);
    setError("");

    return fetchJson(authFetch, `/api/break-times/${active.id}/end`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        break_end_at: new Date().toISOString(),
      }),
    })
      .then(() => reloadAll())
      .catch((e: any) => {
        setError(e?.message ?? "failed");
        return reloadAll();
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const hasToday = !!today?.id;
  const isCheckedOut = !!today?.check_out_at;
  const isOnBreak = breaks.some((b) => b.break_end_at === null);

  const canCheckIn = !hasToday;
  const canCheckOut = hasToday && !isCheckedOut && !isOnBreak;
  const canStartBreak = hasToday && !isCheckedOut && !isOnBreak;
  const canEndBreak = hasToday && !isCheckedOut && isOnBreak;

  return {
    today,
    breaks,
    loading,
    error,

    reloadAll,
    checkIn,
    checkOut,
    startBreak,
    endBreak,

    canCheckIn,
    canCheckOut,
    canStartBreak,
    canEndBreak,
  };
}
