// src/components/dateRequests/DateRequestListView.tsx
import type { DateRequest } from "../../types/dateRequest";
import { formatUtcToJst } from "../../utils/time";

export default function DateRequestListView({
  items,
  loading,
}: {
  items: DateRequest[];
  loading: boolean;
}) {
  return (
    <div className="mt-4 overflow-auto rounded border bg-white">
      <table className="min-w-[900px] w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">id</th>
            <th className="p-2">start_date</th>
            <th className="p-2">end_date</th>
            <th className="p-2">session</th>
            <th className="p-2">status</th>
            <th className="p-2">reason</th>
            <th className="p-2">created_at</th>
          </tr>
        </thead>

        <tbody>
          {items.map((x) => (
            <tr key={x.id} className="border-b">
              <td className="p-2">{x.id}</td>
              <td className="p-2">{x.start_date}</td>
              <td className="p-2">{x.end_date}</td>
              <td className="p-2">{x.session}</td>
              <td className="p-2">{x.status}</td>
              <td className="p-2">{x.reason}</td>
              <td className="p-2">{formatUtcToJst(x.created_at)}</td>
            </tr>
          ))}

          {items.length === 0 && !loading && (
            <tr>
              <td className="p-2" colSpan={7}>
                データなし
              </td>
            </tr>
          )}

          {loading && (
            <tr>
              <td className="p-2" colSpan={7}>
                読み込み中...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
