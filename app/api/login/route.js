import { NextResponse } from "next/server";
import { createSession, directory, meetsPolicy, sha256Hex, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req) {
  const { username = "", password = "", remember = false } = await req.json().catch(() => ({}));
  const u = String(username).trim().toLowerCase();
  if (!u || !password) return NextResponse.json({ error: "Enter your username and password." }, { status: 400 });
  if (!meetsPolicy(password)) return NextResponse.json({ error: "That password doesn't meet the policy: 8+ characters, a number, and a special character." }, { status: 400 });
  const hash = await sha256Hex(password);
  const user = directory().find(d => d.username === u && d.hash && d.hash === hash);
  if (!user) return NextResponse.json({ error: "Username or password is incorrect." }, { status: 401 });
  const days = remember ? 7 : 0.34; // 7 days, or about 8 hours
  const res = NextResponse.json({ ok: true, name: user.name });
  res.cookies.set(SESSION_COOKIE, await createSession(user, days), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: Math.round(days * 86400) });
  return res;
}
