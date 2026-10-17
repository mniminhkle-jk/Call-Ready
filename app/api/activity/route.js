import { logActivity, touchAccount, touchContact } from "@/lib/db";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
const ALLOWED = { "email-sent": "Sent CRVA email", "linkedin-sent": "Sent LinkedIn note", "email-drafted": "Drafted CRVA email", "linkedin-drafted": "Drafted LinkedIn note", "brief-downloaded": "Downloaded brief" };
export const POST = handle(async req => {
  const user = await requireUser();
  const { account_id, contact_id, kind, detail } = await req.json();
  if (!account_id || !ALLOWED[kind]) return fail("Unknown activity.");
  await logActivity(account_id, user.name, ALLOWED[kind], detail || "", contact_id || null);
  if (kind.endsWith("-sent")) { await touchAccount(account_id); await touchContact(contact_id); }
  return json({ ok: true });
});
