// src/App.tsx
import { Link, Route, Routes } from "react-router-dom";

function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-semibold">勤怠アプリ</h1>
      <p className="mt-2 text-sm text-slate-600">
        まずは pages だけで作っていきます。
      </p>

      <div className="mt-4">
        <Link className="text-sm text-blue-600 underline" to="/attendance">
          勤怠ページへ
        </Link>
      </div>
    </div>
  );
}

function AttendancePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h2 className="text-lg font-semibold">勤怠</h2>
      <p className="mt-2 text-sm text-slate-600">ここから作り込みます。</p>

      <div className="mt-4">
        <Link className="text-sm text-blue-600 underline" to="/">
          戻る
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/attendance" element={<AttendancePage />} />
    </Routes>
  );
}
