import { db, logActivity } from "@/lib/db";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
const FIELDS = ["name", "title", "role_type", "linkedin_url", "email", "phone", "why", "decisions", "contact_source", "location"];
export const PATCH = handle(async (req, { params }) => {
  const user = await requireUser();
  const b = await req.json();
  const sb = db();
  const { data: c } = await sb.from("contacts").select("*").eq("id", params.cid).maybeSingle();
  if (!c) return fail("Contact not found.", 404);
  const now = new Date().toISOString();
  const upd = { updated_at: now };
  let detail = "Updated contact";
  for (const f of FIELDS) if (f in b) upd[f] = b[f] === "" ? null : b[f];
  if (upd.title === null) return fail("A title is required.");
  if (b.addHook) {
    const h = b.addHook;
    if (!h.text?.trim()) return fail("Write the hook first.");
    if (!/^https?:\/\//.test(h.src || "")) return fail("Every hook needs the public URL where you found it.");
    upd.hooks = [...(c.hooks || []), { text: h.text.trim(), say: h.say?.trim() || null, type: h.type === "personal" ? "personal" : "professional", src: h.src, confirmed: h.type !== "personal" ? true : !!h.confirmed, by: user.name }];
    detail = "Added a Connect hook";
  }
  if (typeof b.confirmHook === "number") { upd.hooks = (c.hooks || []).map((h, i) => (i === b.confirmHook ? { ...h, confirmed: true, confirmedBy: user.name } : h)); detail = "Confirmed a personal hook"; }
  if (b.markReviewed) { upd.refreshed_at = now; detail = "Marked brief reviewed"; }
  if (b.sharpest || b.addLine) {
    const brief = structuredClone(c.brief || {});
    if (b.sharpest) {
      if (!b.sharpest.text?.trim()) return fail("The Sharpest Signal can't be empty.");
      brief.sharpest = { ...(brief.sharpest || {}), text: b.sharpest.text.trim(), why: (b.sharpest.why || "").trim() };
      detail = "Updated Sharpest Signal";
    } else {
      const { text, tag, url, title } = b.addLine;
      if (!text?.trim()) return fail("Write the line first.");
      let src;
      if (tag === "verified") {
        if (!/^https?:\/\//.test(url || "")) return fail("A verified line needs a source URL starting with http.");
        brief.sources = brief.sources || [];
        const ex = brief.sources.find(s => s.url === url);
        src = ex ? ex.n : Math.max(0, ...brief.sources.map(s => s.n)) + 1;
        if (!ex) brief.sources.push({ n: src, title: title || url, url, date: now.slice(0, 10) });
      }
      brief.known = [...(brief.known || []), { text: text.trim(), tag: tag === "verified" ? "verified" : "inferred", ...(src ? { src } : {}), by: user.name, at: now }];
      detail = `Added ${tag === "verified" ? "verified" : "inferred"} line`;
    }
    await sb.from("brief_history").insert({ account_id: c.account_id, contact_id: c.id, brief: c.brief, saved_by: user.name, reason: `Before: ${detail}` });
    upd.brief = brief;
  }
  await sb.from("contacts").update(upd).eq("id", c.id);
  await logActivity(c.account_id, user.name, detail, c.name || c.title, c.id);
  return json({ ok: true });
});
