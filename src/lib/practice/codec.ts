import { parsePracticePayload, type PracticeParse, type PracticePayload } from "./schema";

const DEMO_TOKEN = "demo";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(token: string): Uint8Array {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((token.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodePracticePayload(payload: PracticePayload): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export function decodePracticeToken(token: string): PracticeParse<unknown> {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "payload: empty practice token" };
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { ok: false, error: "payload: practice token is not URL-safe base64" };
  }
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(trimmed));
    return { ok: true, value: JSON.parse(json) as unknown };
  } catch {
    return { ok: false, error: "payload: practice token is not valid JSON" };
  }
}

export function parsePracticeSearch(
  token: string | undefined,
  demo: PracticePayload,
): PracticeParse<PracticePayload> | { ok: true; value: null } {
  if (!token) return { ok: true, value: null };
  if (token === DEMO_TOKEN) {
    return parsePracticePayload(demo);
  }
  const decoded = decodePracticeToken(token);
  if (!decoded.ok) return decoded;
  return parsePracticePayload(decoded.value);
}

export { DEMO_TOKEN };
