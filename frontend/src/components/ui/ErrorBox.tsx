// src/components/ui/ErrorBox.tsx
type Props = {
  title?: string;
  message?: string | null;
  className?: string;
};

export default function ErrorBox({
  title = "Error",
  message,
  className,
}: Props) {
  if (!message) return null;

  return (
    <div
      className={[
        "rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200",
        className ?? "",
      ].join(" ")}
      role="alert"
      aria-live="polite"
    >
      <div className="text-xs font-semibold text-red-700">{title}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-red-700">
        {message}
      </div>
    </div>
  );
}
