// src/hooks/attendance/useAttendanceLists.ts
import { useState } from "react";
import type { Attendance } from "../../types/attendance";
import { fetchJson } from "../../utils/http";
import { unwrapArray } from "../../utils/unwrap";
import { useAuthToken } from "../useAuthToken";

export function useAttendanceLists() {
  const { authFetch } = useAuthToken();

  const [items, setItems] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function clear() {
    setItems([]);
    setError("");
  }

  function load() {
    setLoading(true);
    setError("");

    fetchJson(authFetch, "/api/attendances", { method: "GET" })
      .then((json) => {
        setItems(unwrapArray<Attendance>(json));
      })
      .catch((e: any) => {
        setError(e?.message ?? "failed to load");
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return {
    items,
    loading,
    error,
    load,
    clear,
  };
}
