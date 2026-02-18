// src/utils/normalize.ts

/**
 * dateカラムの「表示用」正規化
 *
 * 期待： "YYYY-MM-DD"
 * でも現実： "2026/02/18T00:00:00.000000Z" みたいに来ることがあるので吸収する
 *
 * 方針：
 * - 値の意味（タイムゾーン）を正しに行かない。表示だけ整える。
 * - 先頭10文字を日付として扱う（2026-02-18 / 2026/02/18 の両対応）
 */
export function normalizeDateOnly(input: string | null | undefined): string {
  if (!input) return "";

  const s = String(input).trim();
  if (!s) return "";

  // 例:
  // - "2026-02-18"
  // - "2026-02-18T00:00:00.000000Z"
  // - "2026/02/18T00:00:00.000000Z"
  // - "2026/02/18 00:00:00"
  const head = s.slice(0, 10);

  // 念のため最低限チェック（数字8桁相当ならOK）
  // "YYYY-MM-DD" or "YYYY/MM/DD" のどちらかを想定
  if (head.length !== 10) return "";

  return head.replaceAll("/", "-");
}

/**
 * 任意：空文字のときの代替表示（UIで使うなら）
 */
export function showOrDash(value: string): string {
  return value ? value : "—";
}
