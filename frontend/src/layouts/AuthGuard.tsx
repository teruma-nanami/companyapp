import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>読み込み中...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
}
