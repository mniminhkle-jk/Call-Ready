import { db, logActivity } from "@/lib/db";
import { refreshSignals } from "@/lib/integrations";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
export const maxDuration = 60;
export const POST = handle(async (req, { params }) => {
  const user = await requireUser();
  const { data: a } = await db().from("accounts").select("id,name").eq("id", params.id).maybeSingle();
  if (!a) return fail("Account not found.", 404);
  const r = await refreshSignals(a);
  await logActivity(a.id, user.name, "Ran Exa signal check", `${r.inserted} new`);
  return json(r);
});
