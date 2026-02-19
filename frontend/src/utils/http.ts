// src/utils/http.ts
import { readErrorMessage } from "./message";

export function fetchJson(
  authFetch: (url: string, init?: RequestInit) => Promise<Response>,
  url: string,
  init?: RequestInit,
): Promise<unknown> {
  return authFetch(url, init).then(async (res) => {
    if (!res.ok) throw new Error(await readErrorMessage(res));
    return (await res.json()) as unknown;
  });
}

export function fetchNoContent(
  authFetch: (url: string, init?: RequestInit) => Promise<Response>,
  url: string,
  init?: RequestInit,
): Promise<void> {
  return authFetch(url, init).then(async (res) => {
    if (!res.ok) throw new Error(await readErrorMessage(res));
  });
}
