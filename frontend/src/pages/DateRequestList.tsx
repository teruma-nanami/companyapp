// src/pages/DateRequestList.tsx
import DateRequestDetailModal from "../components/dateRequests/DateRequestDetailModal";
import DateRequestListView from "../components/dateRequests/DateRequestListView";
import { useDateRequestList } from "../hooks/request/useDateRequestList";

export default function DateRequestList() {
  const dr = useDateRequestList();

  if (!dr.isAuthenticated) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-bold">休日申請（管理）</h1>

        <p className="mt-3 text-sm">このページはログインが必要です。</p>

        <button
          className="mt-2 rounded border px-3 py-1 text-sm"
          onClick={() => dr.loginWithRedirect()}
        >
          ログイン
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">休日申請（管理）</h1>

      <div className="mt-3">
        <button
          className="rounded border px-3 py-1 text-sm"
          onClick={dr.load}
          disabled={dr.loading}
        >
          {dr.loading ? "読み込み中..." : "再読込"}
        </button>
      </div>

      {dr.error && (
        <p className="mt-3 text-sm" style={{ color: "crimson" }}>
          Error: {dr.error}
        </p>
      )}

      <DateRequestListView
        items={dr.items}
        loading={dr.loading}
        error={dr.error}
        onClickDetail={dr.openDetail}
      />

      <p className="mt-3 text-xs text-slate-600">
        ※ 全員分の一覧は、バックエンドに admin 用の GET が用意できたら{" "}
        <code>LIST_URL</code> を差し替えるだけで切り替えできます。
      </p>

      <DateRequestDetailModal
        open={dr.openModal}
        saving={dr.saving}
        error={dr.modalError}
        item={dr.selected}
        onClose={dr.closeDetail}
        onApprove={dr.approve}
        onReject={dr.reject}
      />
    </div>
  );
}
