import { db } from "./db.js";
import { SEED_ACCOUNTS, RESEARCHED_ON, SAMPLE_REPS } from "./seed.js";
import { sampleDeals, SAMPLE_TRANSCRIPTS, SAMPLE_CRM_ACTIVITY } from "./sample.js";
import { parseTranscript, scoreCall } from "./score.js";

// Loads the three sample accounts (and labeled sample sales/training data) the first time the portal runs.
// Never overwrites rep edits.
export async function ensureSeed() {
  const sb = db();
  const { count, error } = await sb.from("accounts").select("id", { count: "exact", head: true });
  if (error) throw error;
  if (count > 0) return false;
  const at = new Date(RESEARCHED_ON + "T17:30:00-05:00").toISOString();
  await sb.from("reps").upsert(SAMPLE_REPS);
  for (const a of SEED_ACCOUNTS) {
    const { contacts, signals, ...acct } = a;
    await sb.from("accounts").upsert({ ...acct, refreshed_at: at, signals_checked_at: at, created_at: at, updated_at: at });
    const { data: inserted } = await sb.from("contacts").insert(contacts.map(c => ({ ...c, account_id: a.id, refreshed_at: at, created_by: "research-agent" }))).select("id,name");
    await sb.from("signals").upsert(signals.map(s => ({ ...s, account_id: a.id, status: "reviewed", source: "exa", published_at: s.published_at + "T12:00:00Z" })), { onConflict: "account_id,url", ignoreDuplicates: true });
    await sb.from("activity").insert({ account_id: a.id, source: "call_ready", actor: "Research agent", action: "Profile and contact briefs created", detail: `Public sources via Exa, ${RESEARCHED_ON}`, created_at: at });
    // Sample practice calls (labeled) against two contacts per account
    for (const [i, t] of SAMPLE_TRANSCRIPTS.entries()) {
      const c = (inserted || [])[i % 4];
      if (!c) continue;
      const contact = contacts.find(x => x.name === c.name);
      const sig = contact?.brief?.crva?.liShort?.replace(/^(Congrats on|Saw|Read about|Enjoyed your talk on) /i, "").replace(/\.$/, "") || "your recent news";
      const text = t.text.replace("{signal}", sig.charAt(0).toLowerCase() + sig.slice(1));
      const turns = parseTranscript(null, text.replace(/^Rep:/gm, "User:").replace(/^Prospect:/gm, "Agent:"));
      const score = scoreCall(turns, a, contact?.brief);
      const when = new Date(Date.parse(at) - (i * 3 + SEED_ACCOUNTS.indexOf(a)) * 864e5).toISOString();
      await sb.from("mock_calls").insert({ account_id: a.id, contact_id: c.id, rep: t.rep, goal: "Book a 15-minute discovery meeting", difficulty: "busy", status: "ended", duration_s: 150 + i * 40, cost_cents: 0, transcript: text, score, is_sample: true, created_at: when, ended_at: when });
    }
  }
  await sb.from("deals").insert(sampleDeals(SEED_ACCOUNTS.map(a => a.id)));
  const { data: allContacts } = await sb.from("contacts").select("id,name");
  for (const x of SAMPLE_CRM_ACTIVITY) {
    const { daysAgo, contact, ...row } = x;
    await sb.from("activity").insert({ ...row, contact_id: contact ? (allContacts || []).find(c => c.name === contact)?.id || null : null, created_at: new Date(Date.now() - daysAgo * 864e5).toISOString() });
  }
  return true;
}
