// src/layouts/Layout.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  const { isAuthenticated, user, loginWithRedirect, logout, isLoading } =
    useAuth0();

  function onLogin() {
    loginWithRedirect();
  }

  function onLogout() {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-semibold">
              勤怠アプリ
            </Link>

            <nav className="flex gap-2">
              <Link to="/attendance" className="px-2 py-1">
                勤怠
              </Link>
            </nav>
            <nav className="flex gap-2">
              <Link to="/contacts/list" className="px-2 py-1">
                お問い合わせ一覧
              </Link>
            </nav>
            <nav className="flex gap-2">
              <Link to="/tasks" className="px-2 py-1">
                タスク一覧
              </Link>
            </nav>
            <nav className="flex gap-2">
              <Link to="/items" className="px-2 py-1">
                在庫一覧
              </Link>
            </nav>
            <nav className="flex gap-2">
              <Link to="/date-requests" className="px-2 py-1">
                休日申請
              </Link>
            </nav>
            <nav className="flex gap-2">
              <Link to="/date-requests/list" className="px-2 py-1">
                休日申請一覧
              </Link>
            </nav>
            <nav className="flex gap-2">
              <Link to="/profile" className="px-2 py-1">
                プロフィール
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-slate-600">Loading...</span>
            ) : isAuthenticated ? (
              <>
                <span className="text-sm text-slate-700">
                  {user?.name ?? user?.email ?? "ログイン中"}
                </span>
                <button className="rounded border px-3 py-1" onClick={onLogout}>
                  ログアウト
                </button>
              </>
            ) : (
              <button className="rounded border px-3 py-1" onClick={onLogin}>
                ログイン
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
