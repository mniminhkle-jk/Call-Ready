import { db, logActivity } from "@/lib/db";
import { refreshSignals } from "@/lib/integrations";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
export const maxDuration = 60;
export const POST = handle(async req => {
  const user = await requireUser();
  const { name, website, segment, hq } = await req.json();
  if (!name?.trim()) return fail("Enter the company name.");
  if (!["Manufacturer", "Distributor", "Retailer"].includes(segment)) return fail("Pick a segment: manufacturer, distributor or retailer.");
  const id = name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const sb = db();
  const { data: exists } = await sb.from("accounts").select("id").eq("id", id).maybeSingle();
  if (exists) return fail("That account already exists.", 409);
  const now = new Date().toISOString();
  const brief = { overview: "", address: "", facts: [], freight: [], locations: [], leadership: [], sources: [], research: { agentMinutes: 0, reviewMinutes: 0, gaps: ["New account: review the signals the Exa check found and add facts with sources."] } };
  const { error } = await sb.from("accounts").insert({ id, name: name.trim(), website: website || null, segment, hq: hq || null, stage: "Research", owner: user.name, brief, created_at: now, updated_at: now });
  if (error) throw error;
  await logActivity(id, user.name, "Created account", name.trim());
  const t0 = Date.now();
  let r = { inserted: 0, errors: [] };
  try { r = await refreshSignals({ id, name: name.trim() }); } catch (e) { r.errors = [e.message]; }
  const mins = Math.max(1, Math.round((Date.now() - t0) / 60000));
  await sb.from("accounts").update({ brief: { ...brief, research: { ...brief.research, agentMinutes: mins } } }).eq("id", id);
  return json({ id, signals: r.inserted, errors: r.errors });
});
