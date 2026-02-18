// src/pages/Contact.tsx
import { useContact } from "../hooks/contact/useContact";

export default function Contact() {
  const { values, setField, submitting, success, error, submit } = useContact();

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">お問い合わせ</h1>
          <p className="mt-1 text-sm text-slate-600">
            入力して送信してください
          </p>
        </div>
      </div>

      {(success || error) && (
        <div className="mt-4">
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="text-xs font-semibold text-emerald-700">
                Success
              </div>
              <div className="mt-1 text-sm text-emerald-700">{success}</div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="text-xs font-semibold text-red-700">Error</div>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            お名前
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            メールアドレス
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            type="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            件名
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={values.subject}
            onChange={(e) => setField("subject", e.target.value)}
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            カテゴリ
          </label>
          <select
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={values.category}
            onChange={(e) => setField("category", e.target.value)}
            disabled={submitting}
          >
            <option value="bug">不具合</option>
            <option value="request">要望</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            本文
          </label>
          <textarea
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            rows={5}
            value={values.message}
            onChange={(e) => setField("message", e.target.value)}
            disabled={submitting}
          />
        </div>

        <button
          className="mt-2 w-full rounded-2xl bg-blue-600 px-4 py-4 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "送信中..." : "送信"}
        </button>
      </div>
    </div>
  );
}
