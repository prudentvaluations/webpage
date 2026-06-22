import crypto from "node:crypto";

export const ADMIN_COOKIE = "pv_admin";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours (seconds)

const secret = () => process.env.ADMIN_SESSION_SECRET || "";

function hmac(payload) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

// Constant-time string compare
function safeEqual(a, b) {
  const ba = Buffer.from(a || "");
  const bb = Buffer.from(b || "");
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export function checkPassword(pw) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || !pw) return false;
  return safeEqual(pw, expected);
}

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE * 1000 })).toString(
    "base64url"
  );
  return `${payload}.${hmac(payload)}`;
}

export function verifySessionToken(token) {
  if (!token || !secret()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, hmac(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}
