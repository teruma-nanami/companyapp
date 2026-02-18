// src/hooks/request/useDateRequestDetailModal.ts
import { useEffect, useState } from "react";
import type { DateRequest } from "../../types/dateRequest";

export function useDateRequestDetailModal(params: {
  open: boolean;
  saving: boolean;

  item: DateRequest | null;

  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, rejected_reason: string) => void;
}) {
  const { open, saving, item, onClose, onApprove, onReject } = params;

  const [localError, setLocalError] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");

  useEffect(() => {
    if (!open) return;

    setLocalError("");
    setRejectedReason("");
  }, [open]);

  const isPending = String(item?.status ?? "") === "pending";

  function requestClose(): void {
    if (saving) return;
    onClose();
  }

  function clickApprove(): void {
    if (!item) return;
    setLocalError("");
    onApprove(item.id);
  }

  function clickReject(): void {
    if (!item) return;
    setLocalError("");

    const rr = String(rejectedReason ?? "").trim();
    onReject(item.id, rr);
  }

  return {
    localError,
    setLocalError,

    rejectedReason,
    setRejectedReason,

    isPending,

    requestClose,
    clickApprove,
    clickReject,
  };
}
