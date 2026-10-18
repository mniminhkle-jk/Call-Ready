import { db, logActivity, touchAccount, touchContact } from "@/lib/db";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
export const POST = handle(async req => {
  const user = await requireUser();
  const b = await req.json();
  if (!b.account_id || !b.prn?.purpose?.trim()) return fail("Add the purpose (P): one sentence on why you met.");
  const filled = Object.values(b.prn.results || {}).filter(v => String(v || "").trim()).length;
  if (filled < 3) return fail(`Add at least 3 of the 7 Results (R). You have ${filled}.`);
  if (!(b.prn.next || []).some(n => n.text?.trim() && n.due)) return fail("Add at least one next step (N) with a due date.");
  const sb = db();
  const { error } = await sb.from("notes").insert({ account_id: b.account_id, contact_id: b.contact_id || null, author: user.name, kind: b.kind || "call", method: b.method || null, prn: b.prn, granola_id: b.granola_id || null });
  if (error) { if (/duplicate key/.test(error.message)) return fail("That Granola meeting was already saved as a note.", 409); throw error; }
  await touchAccount(b.account_id);
  await touchContact(b.contact_id);
  if (b.stage) {
    const { data: a } = await sb.from("accounts").select("stage").eq("id", b.account_id).single();
    if (a && a.stage !== b.stage) { await sb.from("accounts").update({ stage: b.stage }).eq("id", b.account_id); await logActivity(b.account_id, user.name, "Changed stage", `${a.stage} → ${b.stage}`, b.contact_id); }
  }
  await logActivity(b.account_id, user.name, b.kind === "granola" ? "Saved Granola meeting as PRN note" : "Logged call notes", b.prn.purpose, b.contact_id);
  return json({ ok: true });
});
