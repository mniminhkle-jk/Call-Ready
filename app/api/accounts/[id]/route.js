import { db, logActivity } from "@/lib/db";
import { handle, json, fail, requireUser } from "@/lib/apiutil";


export const PATCH = handle(async (req, { params }) => {
  const user = await requireUser();
  const body = await req.json();
  const sb = db();
  const { data: a } = await sb.from("accounts").select("*").eq("id", params.id).maybeSingle();
  if (!a) return fail("Account not found.", 404);
  const now = new Date().toISOString();

  if (body.stage) {
    await sb.from("accounts").update({ stage: body.stage, updated_at: now }).eq("id", a.id);
    await logActivity(a.id, user.name, "Changed stage", `${a.stage} → ${body.stage}`);
    return json({ ok: true });
  }
  if (body.markReviewed) {
    await sb.from("accounts").update({ refreshed_at: now, updated_at: now }).eq("id", a.id);
    await sb.from("brief_history").insert({ account_id: a.id, brief: a.brief, saved_by: user.name, reason: "Marked reviewed" });
    await logActivity(a.id, user.name, "Marked brief reviewed");
    return json({ ok: true });
  }

  // Company profile edits: add a fact found (with source). Snapshot the old version first.
  const brief = structuredClone(a.brief || {});
  let detail = "";
  if (body.addFact) {
    const { label, text, url, title } = body.addFact;
    if (!text?.trim()) return fail("Write the fact first.");
    if (!/^https?:\/\//.test(url || "")) return fail("Company facts need a source URL. Guesses belong in a person brief as inferred lines.");
    brief.sources = brief.sources || [];
    const ex = brief.sources.find(s => s.url === url);
    const src = ex ? ex.n : Math.max(0, ...brief.sources.map(s => s.n)) + 1;
    if (!ex) brief.sources.push({ n: src, title: title || url, url, date: now.slice(0, 10) });
    brief.facts = [...(brief.facts || []), { label: (label || "Fact").trim(), text: text.trim(), src, by: user.name, at: now }];
    detail = `Added fact: ${label || "Fact"}`;
  } else return fail("Nothing to update.");

  await sb.from("brief_history").insert({ account_id: a.id, brief: a.brief, saved_by: user.name, reason: `Before: ${detail}` });
  await sb.from("accounts").update({ brief, updated_at: now }).eq("id", a.id);
  await logActivity(a.id, user.name, "Edited brief", detail);
  return json({ ok: true });
});
