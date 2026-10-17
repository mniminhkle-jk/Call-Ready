import { db } from "@/lib/db";
import { parseTranscript, scoreCall } from "@/lib/score";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
// Scores a pasted practice transcript (no voice, no Retell credit used).
export const POST = handle(async req => {
  await requireUser();
  const { account_id, transcript } = await req.json();
  const { data: a } = await db().from("accounts").select("*").eq("id", account_id).maybeSingle();
  if (!a) return fail("Account not found.", 404);
  const normalized = (transcript || "").replace(/^\s*(rep|me|you)\s*:/gim, "User:").replace(/^\s*(prospect|them|buyer)\s*:/gim, "Agent:");
  const turns = parseTranscript(null, normalized);
  if (turns.length < 2) return fail("Paste at least two lines, each starting with “Rep:” or “Prospect:”.");
  return json({ score: scoreCall(turns, a), turns });
});
