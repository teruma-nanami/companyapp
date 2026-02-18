// src/pages/DateRequest.tsx
import { useState } from "react";
import DateRequestModal from "../components/dateRequests/DateRequestModal";
import { useDateRequest } from "../hooks/request/useDateRequest";
import { normalizeDateOnly, showOrDash } from "../utils/normalize";

function sessionLabel(v: string) {
  if (v === "full") return "終日";
  if (v === "am") return "午前";
  if (v === "pm") return "午後";
  return v;
}

function statusLabel(v: string) {
  if (v === "pending") return "申請中";
  if (v === "approved") return "承認";
  if (v === "rejected") return "却下";
  return v;
}

export default function DateRequestPage() {
  const dr = useDateRequest();

  // modal
  const [openModal, setOpenModal] = useState(false);
  const [modalError, setModalError] = useState("");

  function openCreateModal(): void {
    setModalError("");
    setOpenModal(true);
  }

  function closeCreateModal(): void {
    if (dr.saving) return;
    setOpenModal(false);
    setModalError("");
  }

  function create(input: {
    start_date: string;
    end_date: string;
    session: "full" | "am" | "pm";
    reason: string;
  }): void {
    setModalError("");

    dr.create(input)
      .then(() => {
        setOpenModal(false);
      })
      .catch((e: any) => {
        // hook 側で error はセット済みだが、モーダル内にも出したいので写す
        setModalError(e?.message ?? "failed to create");
      });
  }

  // 未ログインはメニューに出ない前提
  if (!dr.isAuthenticated) return null;

  const btnPrimary =
    "rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50";
  const btnGhost =
    "rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto w-full max-w-[1100px] space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              休日申請
            </h1>
            <div className="mt-2 text-sm text-slate-600">
              申請はモーダルから作成します。一覧は自動で再読込されます。
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className={btnPrimary}
              onClick={openCreateModal}
              disabled={dr.saving}
            >
              ＋ 申請する
            </button>

            <button
              className={btnGhost}
              onClick={dr.load}
              disabled={dr.loading}
            >
              {dr.loading ? "読込中..." : "再読込"}
            </button>
          </div>
        </div>

        {dr.error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
            <div className="text-xs font-semibold text-red-700">Error</div>
            <div className="mt-0.5 text-sm text-red-700">{dr.error}</div>
          </div>
        ) : null}

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm font-semibold text-slate-900">申請一覧</div>
            <div className="text-xs text-slate-500">{dr.items.length} 件</div>
          </div>

          <div className="px-4 pb-4">
            <div className="rounded-xl ring-1 ring-slate-900/5">
              <table className="w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-900/5 bg-slate-50">
                    <th className="w-[64px] p-2">id</th>
                    <th className="w-[120px] p-2">start</th>
                    <th className="w-[120px] p-2">end</th>
                    <th className="w-[84px] p-2">session</th>
                    <th className="w-[84px] p-2">status</th>
                    <th className="hidden p-2 md:table-cell">reason</th>
                    <th className="hidden p-2 lg:table-cell">
                      rejected_reason
                    </th>
                    <th className="hidden w-[140px] p-2 lg:table-cell">
                      created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dr.items.map((r) => (
                    <tr key={r.id} className="border-b border-slate-900/5">
                      <td className="p-2">{r.id}</td>
                      <td className="p-2">{normalizeDateOnly(r.start_date)}</td>
                      <td className="p-2">{normalizeDateOnly(r.end_date)}</td>
                      <td className="p-2">{sessionLabel(String(r.session))}</td>
                      <td className="p-2">{statusLabel(String(r.status))}</td>

                      <td className="hidden p-2 md:table-cell">
                        <div className="truncate">{r.reason}</div>
                      </td>

                      <td className="hidden p-2 lg:table-cell">
                        <div className="truncate">
                          {showOrDash((r.rejected_reason ?? "").trim())}
                        </div>
                      </td>

                      <td className="hidden p-2 lg:table-cell">
                        <div className="truncate">
                          {normalizeDateOnly(r.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {dr.items.length === 0 && !dr.loading && !dr.error && (
                    <tr>
                      <td className="p-2" colSpan={8}>
                        データなし
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <DateRequestModal
          open={openModal}
          saving={dr.saving}
          error={modalError}
          onClose={closeCreateModal}
          onSubmit={create}
        />
      </div>
    </div>
  );
}
