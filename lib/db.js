import { createClient } from "@supabase/supabase-js";
import { memClient } from "./memdb";

let client;
export function db() {
  if (!client && process.env.DEMO_MODE === "1") client = memClient();
  if (!client) {
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Supabase is not configured (SUPABASE_URL / SUPABASE_SECRET_KEY).");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export async function logActivity(account_id, actor, action, detail = "", contact_id = null) {
  await db().from("activity").insert({ account_id, actor, action, detail, contact_id });
}

export async function touchContact(id) {
  if (!id) return;
  const now = new Date().toISOString();
  await db().from("contacts").update({ last_touched_at: now, updated_at: now }).eq("id", id);
}

export async function touchAccount(id) {
  const now = new Date().toISOString();
  await db().from("accounts").update({ last_touched_at: now, updated_at: now }).eq("id", id);
}

// Returns { ok: true } or { ok: false, missing: true } when tables don't exist yet.
export async function schemaStatus() {
  try {
    const { error } = await db().from("accounts").select("id").limit(1);
    if (error) return { ok: false, missing: /relation|does not exist|schema cache/i.test(error.message), error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
