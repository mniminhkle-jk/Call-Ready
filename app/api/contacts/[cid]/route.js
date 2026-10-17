import { db, logActivity } from "@/lib/db";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
const FIELDS = ["name", "title", "role_type", "linkedin_url", "email", "phone", "why", "decisions", "contact_source"];
export const PATCH = handle(async (req, { params }) => {
  const user = await requireUser();
  const b = await req.json();
  const sb = db();
  const { data: c } = await sb.from("contacts").select("*").eq("id", params.cid).maybeSingle();
  if (!c) return fail("Contact not found.", 404);
  const upd = { updated_at: new Date().toISOString() };
  for (const f of FIELDS) if (f in b) upd[f] = b[f] === "" ? null : b[f];
  if (b.addHook) {
    const h = b.addHook;
    if (!h.text?.trim()) return fail("Write the hook first.");
    if (!/^https?:\/\//.test(h.src || "")) return fail("Every hook needs the public URL where you found it.");
    upd.hooks = [...(c.hooks || []), { text: h.text.trim(), say: h.say?.trim() || null, type: h.type === "personal" ? "personal" : "professional", src: h.src, confirmed: h.type !== "personal" ? true : !!h.confirmed, by: user.name }];
  }
  if (typeof b.confirmHook === "number") {
    upd.hooks = (c.hooks || []).map((h, i) => (i === b.confirmHook ? { ...h, confirmed: true, confirmedBy: user.name } : h));
  }
  if (upd.title === null) return fail("A title is required.");
  await sb.from("contacts").update(upd).eq("id", c.id);
  await logActivity(c.account_id, user.name, "Updated contact", c.name || c.title);
  return json({ ok: true });
});
