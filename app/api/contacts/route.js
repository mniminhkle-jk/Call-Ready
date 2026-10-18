import { db, logActivity } from "@/lib/db";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
export const POST = handle(async req => {
  const user = await requireUser();
  const b = await req.json();
  if (!b.account_id || !b.title?.trim()) return fail("A title is required.");
  const { data: a } = await db().from("accounts").select("phones").eq("id", b.account_id).maybeSingle();
  const row = {
    account_id: b.account_id, title: b.title.trim(), name: b.name?.trim() || null, role_type: b.role_type || null, location: b.location || null,
    linkedin_url: b.linkedin_url || null, email: b.email || null, phone: b.phone || null, why: b.why || null, phones: [],
    contact_source: ["crm", "public", "rep"].includes(b.contact_source) ? b.contact_source : "rep", hooks: [], career: [],
    brief: { known: [], cares: [], openers: [], questions: [], sources: [], research: { agentMinutes: 0, reviewMinutes: 0, gaps: ["New contact: brief not built yet. Add what you know, labeled verified or inferred."] } },
    created_by: user.name,
  };
  const { data, error } = await db().from("contacts").insert(row).select("id").single();
  if (error) throw error;
  await logActivity(b.account_id, user.name, "Added contact", row.name ? `${row.name}, ${row.title}` : row.title, data.id);
  return json({ id: data.id });
});
