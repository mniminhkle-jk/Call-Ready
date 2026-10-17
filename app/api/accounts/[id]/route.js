import { db, logActivity } from "@/lib/db";
import { handle, json, fail, requireUser } from "@/lib/apiutil";

const SECTIONS = ["ships", "where", "when", "who"];

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

  // Brief edits: snapshot the old version first so history is never lost.
  const brief = structuredClone(a.brief || {});
  let detail = "";
  if (body.sharpest) {
    if (!body.sharpest.text?.trim()) return fail("The Sharpest Signal can't be empty.");
    brief.sharpest = { ...(brief.sharpest || {}), text: body.sharpest.text.trim(), why: (body.sharpest.why || "").trim() };
    detail = "Updated Sharpest Signal";
  } else if (body.addLine) {
    const { section, text, tag, url, title } = body.addLine;
    if (!text?.trim()) return fail("Write the line first.");
    let src;
    if (tag === "verified") {
      if (!/^https?:\/\//.test(url || "")) return fail("A verified line needs a source URL starting with http.");
      brief.sources = brief.sources || [];
      const existing = brief.sources.find(s => s.url === url);
      src = existing ? existing.n : (Math.max(0, ...brief.sources.map(s => s.n)) + 1);
      if (!existing) brief.sources.push({ n: src, title: title || url, url, date: now.slice(0, 10) });
    }
    const line = { text: text.trim(), tag: tag === "verified" ? "verified" : "inferred", ...(src ? { src } : {}), by: user.name, at: now };
    if (section === "company") brief.company = [...(brief.company || []), line];
    else if (SECTIONS.includes(section)) { brief.freight = brief.freight || {}; brief.freight[section] = [...(brief.freight[section] || []), line]; }
    else return fail("Unknown section.");
    detail = `Added ${line.tag} line to ${section}`;
  } else return fail("Nothing to update.");

  await sb.from("brief_history").insert({ account_id: a.id, brief: a.brief, saved_by: user.name, reason: `Before: ${detail}` });
  await sb.from("accounts").update({ brief, updated_at: now }).eq("id", a.id);
  await logActivity(a.id, user.name, "Edited brief", detail);
  return json({ ok: true });
});
