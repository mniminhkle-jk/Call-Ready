import { pushToCRM, pullFromCRM, crmStatus } from "@/lib/crm";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const GET = handle(async () => { await requireUser(); return json(crmStatus()); });
export const POST = handle(async req => {
  const user = await requireUser();
  const { system, direction } = await req.json();
  if (!["salesforce", "hubspot"].includes(system)) return fail("system must be salesforce or hubspot.");
  return json(direction === "pull" ? await pullFromCRM(system, user.name) : await pushToCRM(system, user.name));
});
