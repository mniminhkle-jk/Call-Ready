import { db, logActivity } from "@/lib/db";
import { parseTranscript, scoreCall } from "@/lib/score";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
// Scores a pasted practice transcript (no voice, no Retell credit used) and saves it to Training.
export const POST = handle(async req => {
  const user = await requireUser();
  const { account_id, contact_id, transcript } = await req.json();
  const sb = db();
  const { data: a } = await sb.from("accounts").select("*").eq("id", account_id).maybeSingle();
  if (!a) return fail("Account not found.", 404);
  const { data: c } = contact_id ? await sb.from("contacts").select("id,brief,name").eq("id", contact_id).maybeSingle() : { data: null };
  const normalized = (transcript || "").replace(/^\s*(rep|me|you)\s*:/gim, "User:").replace(/^\s*(prospect|them|buyer)\s*:/gim, "Agent:");
  const turns = parseTranscript(null, normalized);
  if (turns.length < 2) return fail("Paste at least two lines, each starting with “Rep:” or “Prospect:”.");
  const score = scoreCall(turns, a, c?.brief);
  await sb.from("mock_calls").insert({ account_id, contact_id: c?.id || null, rep: user.name, goal: "Written practice (pasted transcript)", difficulty: "n/a", status: "ended", duration_s: 0, cost_cents: 0, transcript, score });
  await logActivity(account_id, user.name, "Scored written practice", `Call Readiness ${score.total}/100`, c?.id || null);
  return json({ score, turns });
});
