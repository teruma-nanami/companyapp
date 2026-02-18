// src/components/attendance/AttendanceView.tsx
import type { Attendance } from "../../types/attendance";

type Props = {
  today: Attendance | null;
};

export default function AttendanceView({ today }: Props) {
  return (
    <div className="mt-4 overflow-auto rounded border bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="border-b px-3 py-2 text-left font-medium">ID</th>
            <th className="border-b px-3 py-2 text-left font-medium">日付</th>
            <th className="border-b px-3 py-2 text-left font-medium">出勤</th>
            <th className="border-b px-3 py-2 text-left font-medium">退勤</th>
          </tr>
        </thead>

        <tbody>
          {!today ? (
            <tr>
              <td className="px-3 py-3 text-slate-600" colSpan={4}>
                データなし
              </td>
            </tr>
          ) : (
            <tr>
              <td className="border-t px-3 py-2">{today.id}</td>
              <td className="border-t px-3 py-2">{today.work_date}</td>
              <td className="border-t px-3 py-2">{today.check_in_at ?? "—"}</td>
              <td className="border-t px-3 py-2">
                {today.check_out_at ?? "—"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
