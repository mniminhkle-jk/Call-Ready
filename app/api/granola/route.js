import { listGranolaNotes } from "@/lib/integrations";
import { handle, json, requireUser } from "@/lib/apiutil";
export const GET = handle(async () => { await requireUser(); return json({ notes: await listGranolaNotes(30) }); });
export const dynamic = "force-dynamic";
