import { db, logActivity } from "@/lib/db";
import { budgetStatus, createMockCall, BUDGET_CENTS } from "@/lib/integrations";
import { buildPersona, GOALS } from "@/lib/persona";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
export const maxDuration = 30;
export const POST = handle(async req => {
  const user = await requireUser();
  const { account_id, contact_id, goal, difficulty } = await req.json();
  const sb = db();
  const [{ data: a }, { data: c }] = await Promise.all([
    sb.from("accounts").select("*").eq("id", account_id).maybeSingle(),
    sb.from("contacts").select("*").eq("id", contact_id).maybeSingle(),
  ]);
  if (!a || !c) return fail("Account or contact not found.", 404);
  const budget = await budgetStatus();
  if (!budget.canStart) return fail(`Mock-call budget reached: about $${(budget.spent / 100).toFixed(2)} used plus calls in progress, against a $${(BUDGET_CENTS / 100).toFixed(2)} cap. No new calls will start, so the free Retell credit can't be exceeded.`, 402);
  const g = GOALS.includes(goal) ? goal : GOALS[0];
  const vars = buildPersona(a, c, g, difficulty);
  const call = await createMockCall(vars, { account_id, contact_id, rep: user.username });
  await sb.from("mock_calls").insert({ call_id: call.call_id, account_id, contact_id, rep: user.name, goal: g, difficulty: difficulty || "busy", status: "registered" });
  await logActivity(account_id, user.name, "Started practice call", `${vars.persona_name} · ${g}`, contact_id);
  return json({ call_id: call.call_id, access_token: call.access_token, transport: call.transport, ice_servers: call.ice_servers, persona: { name: vars.persona_name, title: vars.persona_title }, budget });
});
