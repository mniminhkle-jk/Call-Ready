// Signed-cookie session using Web Crypto (works in Edge middleware and Node routes).
const enc = new TextEncoder();
export const SESSION_COOKIE = "cr_session";

function b64url(bytes) {
  let s = typeof bytes === "string" ? btoa(bytes) : btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return atob(s);
}
function secret() {
  return process.env.SESSION_SECRET || "dev-only-secret-change-me";
}
async function hmac(data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}
export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
export async function createSession(user, days) {
  const payload = b64url(JSON.stringify({ u: user.username, n: user.name, r: user.role, exp: Date.now() + days * 864e5 }));
  return `${payload}.${await hmac(payload)}`;
}
export async function readSession(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if ((await hmac(payload)) !== sig) return null;
  try {
    const data = JSON.parse(fromB64url(payload));
    if (data.exp < Date.now()) return null;
    return { username: data.u, name: data.n, role: data.r };
  } catch { return null; }
}

// Password policy: at least 8 characters, 1 number, 1 special character.
export const PASSWORD_RULES = [
  { id: "len", text: "At least 8 characters", test: p => p.length >= 8 },
  { id: "num", text: "At least 1 number", test: p => /\d/.test(p) },
  { id: "sym", text: "At least 1 special character (@ - < > # _ !)", test: p => /[^A-Za-z0-9\s]/.test(p) },
];
export const meetsPolicy = p => PASSWORD_RULES.every(r => r.test(p));

// Admin-issued accounts. Prototype: one rep account, password stored as a SHA-256 hash in env.
export function directory() {
  return [{
    username: process.env.PORTAL_USERNAME || "minhkle",
    hash: process.env.PORTAL_PASSWORD_SHA256 || "",
    name: process.env.PORTAL_DISPLAY_NAME || "Minh Le",
    role: "Sales Rep",
  }];
}
