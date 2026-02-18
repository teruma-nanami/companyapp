// src/App.tsx
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Attendance from "./pages/Attendance";
import Contact from "./pages/Contact";
import ContactList from "./pages/ContactList";
import DateRequests from "./pages/DateRequest";
import DateRequestList from "./pages/DateRequestList";
import Items from "./pages/Items";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";

function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth0();

  // 判定中に一瞬 /contact が見えるのが嫌なら、ここで止める
  if (isLoading) return null;

  // ログイン済みなら /attendance へ
  if (isAuthenticated) return <Navigate to="/attendance" replace />;

  // 未ログインなら /（= Contact）を表示
  return <Contact />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="contacts/list" element={<ContactList />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="items" element={<Items />} />
        <Route path="date-requests" element={<DateRequests />} />
        <Route path="date-requests/list" element={<DateRequestList />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
