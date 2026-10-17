import { db, logActivity } from "@/lib/db";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
export const PATCH = handle(async (req, { params }) => {
  const user = await requireUser();
  const { status } = await req.json();
  if (!["new", "reviewed", "dismissed"].includes(status)) return fail("Unknown status.");
  const { data } = await db().from("signals").update({ status }).eq("id", params.sid).select("account_id,title").maybeSingle();
  if (data) await logActivity(data.account_id, user.name, status === "dismissed" ? "Dismissed signal" : "Reviewed signal", data.title);
  return json({ ok: true });
});
