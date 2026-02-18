// src/components/contacts/ContactListView.tsx
import type { Contact } from "../../types/contact";
import { formatUtcToJst } from "../../utils/time";

type Props = {
  items: Contact[];
  loading: boolean;
  error: string;
};

export default function ContactListView({ items, loading, error }: Props) {
  return (
    <div className="mt-4 overflow-auto rounded border bg-white">
      <table className="min-w-[900px] w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">id</th>
            <th className="p-2">name</th>
            <th className="p-2">email</th>
            <th className="p-2">subject</th>
            <th className="p-2">category</th>
            <th className="p-2">status</th>
            <th className="p-2">assigned_user_id</th>
            <th className="p-2">created_at</th>
          </tr>
        </thead>

        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.email}</td>
              <td className="p-2">{c.subject}</td>
              <td className="p-2">{c.category}</td>
              <td className="p-2">{c.status}</td>
              <td className="p-2">{c.assigned_user_id ?? "—"}</td>
              <td className="p-2">{formatUtcToJst(c.created_at)}</td>
            </tr>
          ))}

          {items.length === 0 && !loading && !error && (
            <tr>
              <td className="p-2" colSpan={8}>
                データなし
              </td>
            </tr>
          )}

          {loading && (
            <tr>
              <td className="p-2" colSpan={8}>
                読み込み中...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
