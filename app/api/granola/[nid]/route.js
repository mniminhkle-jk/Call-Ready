import { getGranolaNote, summaryToPRN } from "@/lib/integrations";
import { handle, json, requireUser } from "@/lib/apiutil";
export const GET = handle(async (req, { params }) => { await requireUser(); const note = await getGranolaNote(params.nid); return json({ prn: summaryToPRN(note) }); });
export const dynamic = "force-dynamic";
