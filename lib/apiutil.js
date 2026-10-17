import { NextResponse } from "next/server";
import { getUser } from "./session";
export const json = (data, status = 200) => NextResponse.json(data, { status });
export const fail = (message, status = 400) => NextResponse.json({ error: message }, { status });
export async function requireUser() {
  const u = await getUser();
  if (!u) throw Object.assign(new Error("Sign in required."), { status: 401 });
  return u;
}
export function handle(fn) {
  return async (req, ctx) => {
    try { return await fn(req, ctx); }
    catch (e) { console.error(e); return fail(e.message || "Something went wrong.", e.status || 500); }
  };
}
