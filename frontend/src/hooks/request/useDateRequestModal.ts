// src/hooks/request/useDateRequestModal.ts
import { useEffect, useState } from "react";
import type { DateRequest, DateRequestSession } from "../../types/dateRequest";

type DateRequestCreateInput = Pick<
  DateRequest,
  "start_date" | "end_date" | "session" | "reason"
>;

type Params = {
  open: boolean;
  saving: boolean;

  onClose: () => void;
  onSubmit: (input: DateRequestCreateInput) => void;
};

export function useDateRequestModal(params: Params) {
  const { open, saving, onClose, onSubmit } = params;

  const [localError, setLocalError] = useState("");

  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD
  const [session, setSession] = useState<DateRequestSession>("full");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;

    setLocalError("");
    setStartDate("");
    setEndDate("");
    setSession("full");
    setReason("");
  }, [open]);

  function requestClose(): void {
    if (saving) return;
    onClose();
  }

  function submit(): void {
    setLocalError("");

    const sd = String(startDate ?? "").trim();
    const ed = String(endDate ?? "").trim();
    const rs = String(reason ?? "").trim();

    if (!sd || !ed || !rs) {
      setLocalError("開始日 / 終了日 / 理由 は必須です。");
      return;
    }

    // YYYY-MM-DD は文字列比較でOK
    if (sd > ed) {
      setLocalError("日付の範囲が正しくありません（開始日 <= 終了日）。");
      return;
    }

    onSubmit({
      start_date: sd,
      end_date: ed,
      session,
      reason: rs,
    });
  }

  return {
    localError,

    startDate,
    setStartDate,
    endDate,
    setEndDate,
    session,
    setSession,
    reason,
    setReason,

    requestClose,
    submit,
  };
}
