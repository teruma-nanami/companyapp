// src/utils/time.ts
export function formatUtcToJst(utcIso: string): string {
  // 例: "2026-02-17T08:43:08.000000Z" みたいなのを想定
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return utcIso;

  // JST環境ならそのまま locale でOK（ブラウザが +09:00 で表示する）
  // 表示形式は好みで変えてOK
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
/**
 * "YYYY-MM-DD" を "YYYY/MM/DD" にするだけ（表示を少しだけ読みやすく）
 * 例: "2026-02-17" -> "2026/02/17"
 */
export function formatDateYmdToSlash(ymd: string | null | undefined): string {
  if (!ymd) return "—";
  if (typeof ymd !== "string") return "—";
  // 形式が違っても一旦置換だけ（厳密チェックはしない）
  return ymd.replaceAll("-", "/");
}
