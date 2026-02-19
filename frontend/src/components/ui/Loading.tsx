// src/components/ui/Loading.tsx
type LoadingTextProps = {
  show: boolean;
  text?: string;
  className?: string;
};

export function LoadingText({
  show,
  text = "読み込み中...",
  className,
}: LoadingTextProps) {
  if (!show) return null;

  return (
    <span className={["text-xs text-slate-500", className ?? ""].join(" ")}>
      {text}
    </span>
  );
}

type LoadingButtonTextProps = {
  loading: boolean;
  idleText: string;
  loadingText?: string;
};

export function LoadingButtonText({
  loading,
  idleText,
  loadingText = "読み込み中...",
}: LoadingButtonTextProps) {
  return <>{loading ? loadingText : idleText}</>;
}
