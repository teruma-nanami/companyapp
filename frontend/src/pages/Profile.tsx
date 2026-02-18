// src/pages/Profile.tsx
import { useProfile } from "../hooks/profile/useProfile";

export default function Profile() {
  const p = useProfile();

  if (!p.isAuthenticated) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <h1 className="text-lg font-semibold text-slate-900">プロフィール</h1>

          <p className="mt-3 text-sm text-slate-600">
            プロフィール表示はログインが必要です。
          </p>

          <button
            className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => p.loginWithRedirect()}
          >
            ログイン
          </button>

          {p.error ? (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
              <div className="text-xs font-semibold text-red-700">Error</div>
              <div className="mt-0.5 text-sm text-red-700">{p.error}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const btnGhost =
    "rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50";
  const btnPrimary =
    "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              プロフィール
            </h1>
            <div className="mt-2 text-sm text-slate-600">
              メールアドレスと表示名を編集できます。
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={btnPrimary}
              onClick={p.save}
              disabled={p.saving || !p.canSave()}
            >
              {p.saving ? "保存中..." : "保存"}
            </button>

            <button
              className={btnGhost}
              onClick={p.load}
              disabled={p.loading || p.saving}
            >
              {p.loading ? "読み込み中..." : "再読込"}
            </button>
          </div>
        </div>

        {p.saveOk ? (
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
            <div className="text-xs font-semibold text-emerald-700">OK</div>
            <div className="mt-0.5 text-sm text-emerald-700">{p.saveOk}</div>
          </div>
        ) : null}

        {p.error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
            <div className="text-xs font-semibold text-red-700">Error</div>
            <div className="mt-0.5 text-sm text-red-700">{p.error}</div>
          </div>
        ) : null}

        {p.saveError ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
            <div className="text-xs font-semibold text-red-700">Save Error</div>
            <div className="mt-0.5 text-sm text-red-700">{p.saveError}</div>
          </div>
        ) : null}

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <div className="grid gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-600">email</div>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                value={p.email}
                onChange={(e) => p.setEmail(e.target.value)}
                placeholder="example@example.com"
                disabled={p.loading || p.saving}
              />
              <div className="mt-1 text-xs text-slate-500">
                ログイン用のメールとして使用されます。
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">
                display_name
              </div>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                value={p.displayName}
                onChange={(e) => p.setDisplayName(e.target.value)}
                placeholder="表示名"
                disabled={p.loading || p.saving}
              />
              <div className="mt-1 text-xs text-slate-500">
                画面上に表示される名前です。
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">role</div>
              <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {p.me?.role ?? "—"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                role は管理側で設定されます（この画面では変更できません）。
              </div>
            </div>
          </div>
        </section>

        <div className="text-xs text-slate-500">
          ※
          保存ボタンは、必須項目が埋まり、かつ変更があるときだけ有効になります。
        </div>
      </div>
    </div>
  );
}
