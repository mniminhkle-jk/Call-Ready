import { budgetStatus } from "@/lib/integrations";
import { handle, json, requireUser } from "@/lib/apiutil";
export const GET = handle(async () => { await requireUser(); return json(await budgetStatus()); });
export const dynamic = "force-dynamic";
