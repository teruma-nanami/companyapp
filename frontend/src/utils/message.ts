// src/utils/message.ts

/**
 * エラー本文（json / text）から “表示用” メッセージを作る
 * - JSONなら { message } を優先
 * - textならそのまま
 */
export async function readErrorMessage(res: Response): Promise<string> {
  const ct = res.headers.get("content-type") ?? "";
  const isJson = ct.includes("application/json");

  try {
    if (isJson) {
      const j = (await res.json()) as any;
      const msg = typeof j?.message === "string" ? j.message : "";
      return msg || `Request failed: ${res.status}`;
    }

    const t = await res.text();
    return t || `Request failed: ${res.status}`;
  } catch {
    return `Request failed: ${res.status}`;
  }
}

/**
 * res.text() で取った文字列が JSON っぽい場合に { message } を拾う
 * - 例: Laravel が text で {"message":"..."} を返すケース吸収
 */
export function pickMessage(text: string): string {
  try {
    const obj = JSON.parse(text) as any;
    if (obj && typeof obj.message === "string") return obj.message;
  } catch {
    // ignore
  }
  return text || "Request failed";
}
