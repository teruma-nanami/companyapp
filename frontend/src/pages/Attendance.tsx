// src/pages/Attendance.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import AttendanceView from "../components/attendance/AttendanceView";
import type { Attendance } from "../types/attendance";

export default function AttendancePage() {
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const [today, setToday] = useState<Attendance | null>(null);

  async function load() {
    const token = await getAccessTokenSilently();

    const res = await fetch("/api/attendances/today", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = (await res.json()) as Attendance | null;
    setToday(data);
  }

  useEffect(() => {
    if (isAuthenticated) {
      void load();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <button
          className="rounded border px-3 py-1"
          onClick={() => loginWithRedirect()}
        >
          ログイン
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button className="rounded border px-3 py-1" onClick={() => void load()}>
        再読込
      </button>

      <AttendanceView today={today} />
    </div>
  );
}
