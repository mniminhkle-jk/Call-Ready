import { db } from "./db";
import { SEED_ACCOUNTS, RESEARCHED_ON } from "./seed";

// Inserts the three sample accounts the first time the portal runs. Never overwrites rep edits.
export async function ensureSeed() {
  const sb = db();
  const { count, error } = await sb.from("accounts").select("id", { count: "exact", head: true });
  if (error) throw error;
  if (count > 0) return false;
  const at = new Date(RESEARCHED_ON + "T17:30:00-05:00").toISOString();
  for (const a of SEED_ACCOUNTS) {
    const { contacts, signals, ...acct } = a;
    await sb.from("accounts").upsert({ ...acct, refreshed_at: at, signals_checked_at: at, created_at: at, updated_at: at });
    await sb.from("contacts").insert(contacts.map(c => ({ ...c, account_id: a.id, created_by: "research-agent" })));
    await sb.from("signals").upsert(
      signals.map(s => ({ ...s, account_id: a.id, status: "reviewed", source: "exa", published_at: s.published_at + "T12:00:00Z" })),
      { onConflict: "account_id,url", ignoreDuplicates: true }
    );
    await sb.from("brief_history").insert({ account_id: a.id, brief: acct.brief, saved_by: "research-agent", reason: "Initial brief" });
    await sb.from("activity").insert({ account_id: a.id, actor: "Research agent", action: "Brief created", detail: `Researched with Exa on ${RESEARCHED_ON}` });
  }
  return true;
}
