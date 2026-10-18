import { cookies } from "next/headers";
import { readSession, SESSION_COOKIE } from "./auth.js";
export async function getUser() {
  return readSession(cookies().get(SESSION_COOKIE)?.value);
}
