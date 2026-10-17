import { db, schemaStatus } from "./db";
import { ensureSeed } from "./seeding";
import { assess, nextSteps } from "./rules";

// Ensures the schema exists and seed data is loaded. Returns null if setup is needed.
export async function ready() {
  const s = await schemaStatus();
  if (!s.ok) return s;
  await ensureSeed();
  return { ok: true };
}

export async function listAccountsFull() {
  const sb = db();
  const [{ data: accounts }, { data: contacts }, { data: signals }, { data: notes }] = await Promise.all([
    sb.from("accounts").select("*").order("name"),
    sb.from("contacts").select("*").order("created_at"),
    sb.from("signals").select("id,account_id,title,url,published_at,category,status,summary,created_at"),
    sb.from("notes").select("id,account_id,prn,created_at").order("created_at", { ascending: false }),
  ]);
  return (accounts || []).map(a => {
    const c = (contacts || []).filter(x => x.account_id === a.id);
    const s = (signals || []).filter(x => x.account_id === a.id);
    const n = (notes || []).filter(x => x.account_id === a.id);
    const assessment = assess(a, s, n);
    return { ...a, contacts: c, signals: s, notes: n, assessment, next: nextSteps(a, assessment, c, n) };
  });
}

export async function accountBundle(id) {
  const sb = db();
  const { data: account } = await sb.from("accounts").select("*").eq("id", id).maybeSingle();
  if (!account) return null;
  const [{ data: contacts }, { data: signals }, { data: notes }, { data: activity }, { data: history }, { data: calls }] = await Promise.all([
    sb.from("contacts").select("*").eq("account_id", id).order("created_at"),
    sb.from("signals").select("*").eq("account_id", id).order("published_at", { ascending: false, nullsFirst: false }),
    sb.from("notes").select("*").eq("account_id", id).order("created_at", { ascending: false }),
    sb.from("activity").select("*").eq("account_id", id).order("created_at", { ascending: false }).limit(25),
    sb.from("brief_history").select("id,saved_by,reason,created_at").eq("account_id", id).order("created_at", { ascending: false }).limit(10),
    sb.from("mock_calls").select("id,call_id,contact_id,rep,goal,status,score,duration_s,cost_cents,created_at").eq("account_id", id).order("created_at", { ascending: false }).limit(10),
  ]);
  const assessment = assess(account, signals || [], notes || []);
  return { account, contacts: contacts || [], signals: signals || [], notes: notes || [], activity: activity || [], history: history || [], calls: calls || [], assessment, next: nextSteps(account, assessment, contacts || [], notes || []) };
}
