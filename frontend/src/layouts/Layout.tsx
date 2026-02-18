// src/layouts/Layout.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { Link, Outlet } from "react-router-dom";
import { useProfile } from "../hooks/profile/useProfile";

export default function Layout() {
  const { logout, isLoading } = useAuth0();
  const prof = useProfile();

  function onLogin() {
    prof.loginWithRedirect();
  }

  function onLogout() {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }

  const displayName =
    (prof.me?.display_name && prof.me.display_name.trim()) ||
    (prof.me?.email && prof.me.email.trim()) ||
    "";

  const isAdmin = prof.me?.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 上部バー（青ベース/白文字） */}
      <header className="sticky top-0 z-10 border-b bg-blue-800 text-white">
        <div className="mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-white">
            CompanyApp
          </Link>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm opacity-90">Loading...</span>
            ) : prof.isAuthenticated ? (
              <>
                <span className="text-sm font-semibold opacity-95">
                  {prof.loading
                    ? "プロフィール取得中..."
                    : displayName || "ログイン中"}
                </span>
                <button
                  className="rounded border border-white/70 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
                  onClick={onLogout}
                >
                  ログアウト
                </button>
              </>
            ) : (
              <button
                className="rounded bg-white px-4 py-2 text-sm font-bold text-blue-800 hover:bg-blue-50"
                onClick={onLogin}
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 未ログイン：メニュー全非表示 */}
      {!prof.isAuthenticated ? (
        <div className="mx-auto px-6 py-8">
          <div className="mx-auto w-full max-w-[769px]">
            <Outlet />
          </div>

          <footer className="mx-auto mt-6 mb-6 w-full max-w-[769px] text-center text-sm text-slate-500">
            © {new Date().getFullYear()} CompanyApp
          </footer>
        </div>
      ) : (
        <div className="mx-auto flex min-h-[calc(100vh-64px)]">
          {/* サイドバー：少し細く固定（240px） */}
          <aside className="sticky top-16 h-[calc(100vh-64px)] shrink-0 min-w-[240px] max-w-[240px] bg-blue-800 text-white">
            <div className="flex h-full flex-col">
              <nav className="flex-1 overflow-auto px-3 py-3 text-base">
                <Link
                  to="/attendance"
                  className="block rounded px-3 py-3 font-semibold text-white hover:bg-white/10"
                >
                  勤怠
                </Link>

                <Link
                  to="/contacts/list"
                  className="mt-1 block rounded px-3 py-3 font-semibold text-white hover:bg-white/10"
                >
                  お問い合わせ一覧
                </Link>

                <Link
                  to="/tasks"
                  className="mt-1 block rounded px-3 py-3 font-semibold text-white hover:bg-white/10"
                >
                  タスク一覧
                </Link>

                <Link
                  to="/items"
                  className="mt-1 block rounded px-3 py-3 font-semibold text-white hover:bg-white/10"
                >
                  在庫一覧
                </Link>

                <Link
                  to="/date-requests"
                  className="mt-1 block rounded px-3 py-3 font-semibold text-white hover:bg-white/10"
                >
                  休日申請
                </Link>

                <Link
                  to="/documents"
                  className="mt-1 block rounded px-3 py-3 font-semibold text-white hover:bg-white/10"
                >
                  書類
                </Link>

                <Link
                  to="/profile"
                  className="mt-1 block rounded px-3 py-3 font-semibold text-white hover:bg-white/10"
                >
                  プロフィール
                </Link>

                {/* admin only（プロフィールの下でOK） */}
                {isAdmin ? (
                  <>
                    <Link
                      to="/date-requests/list"
                      className="mt-1 block rounded px-3 py-3 font-semibold text-white hover:bg-white/10"
                    >
                      休日申請一覧
                    </Link>
                    <Link
                      to="/time-requests/list"
                      className="mt-1 block rounded px-3 py-3 font-semibold text-white hover:bg-white/10"
                    >
                      時刻修正申請一覧
                    </Link>
                  </>
                ) : null}
              </nav>
            </div>
          </aside>

          {/* main：min-w-0 が超重要（横幅崩れ防止） */}
          <main className="flex-1 min-w-0">
            {/* ここを「最大 769px」に固定（PC想定） */}
            <div className="mx-auto w-full max-w-[769px]">
              <div className="bg-gray-50 p-6">
                <Outlet />
              </div>

              <footer className="mt-2 mb-6 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} CompanyApp
              </footer>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
