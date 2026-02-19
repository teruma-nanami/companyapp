// src/pages/Attendance.tsx
import { useEffect, useState } from "react";
import AttendanceListView from "../components/attendance/AttendanceListView";
import AttendanceView from "../components/attendance/AttendanceView";
import TimeRequestModal from "../components/attendance/TimeRequestModal";
import { useAttendanceActions } from "../hooks/attendance/useAttendanceActions";
import { useAttendanceLists } from "../hooks/attendance/useAttendanceLists";
import { useAuthToken } from "../hooks/useAuthToken";
import type { Attendance } from "../types/attendance";

export default function AttendancePage() {
  const { isAuthenticated } = useAuthToken();

  // 今日の勤怠 + 休憩 + 操作（出勤/退勤/休憩）
  const {
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
  } = useAttendanceActions();

  // 勤怠一覧（ページング）
  const {
    items,
    loading: listLoading,
    error: listError,
    load,
  } = useAttendanceLists();

  // モーダル制御
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Attendance | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    void reloadAll();
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ルーティング側でガード済み前提なので、ここでは何も出さない
  if (!isAuthenticated) return null;

  async function handleReloadAll() {
    await reloadAll();
  }

  function openTimeRequestModal(attendance: Attendance) {
    setSelected(attendance);
    setModalOpen(true);
  }

  function closeTimeRequestModal() {
    setModalOpen(false);
    setSelected(null);
  }

  async function handleSubmitted() {
    // 申請成功後：今日と一覧を再取得
    await reloadAll();
    await load();
  }

  return (
    <div className="space-y-6">
      <AttendanceView
        today={today}
        breaks={breaks}
        loading={loading}
        error={error}
        onReload={() => void handleReloadAll()}
        onCheckIn={() => void checkIn()}
        onCheckOut={() => void checkOut()}
        onStartBreak={() => void startBreak()}
        onEndBreak={() => void endBreak()}
        canCheckIn={canCheckIn}
        canCheckOut={canCheckOut}
        canStartBreak={canStartBreak}
        canEndBreak={canEndBreak}
      />

      <AttendanceListView
        items={items}
        loading={listLoading}
        error={listError}
        onReload={() => void load()}
        onOpenTimeRequest={(a) => openTimeRequestModal(a)}
      />

      <TimeRequestModal
        open={modalOpen}
        attendance={selected}
        onClose={closeTimeRequestModal}
        onSubmitted={() => void handleSubmitted()}
      />
    </div>
  );
}
