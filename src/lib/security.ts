import crypto from "node:crypto";

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

export function timingSafeEqualHex(a: string, b: string) {
  const aa = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

export function sanitizeText(value: unknown, max = 1000) {
  return String(value ?? "").trim().slice(0, max);
}
