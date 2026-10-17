import { cookies } from "next/headers";
import { readSession, SESSION_COOKIE } from "./auth";
export async function getUser() {
  return readSession(cookies().get(SESSION_COOKIE)?.value);
}
