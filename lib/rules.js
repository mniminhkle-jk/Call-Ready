// Rule-based staleness, criticality, next steps and Main Hub actions. No AI: every flag shows the rule that fired.
import { SIGNAL_KEYWORDS } from "./seed.js";

const DAY = 864e5;
export const daysSince = d => (d ? Math.floor((Date.now() - new Date(d).getTime()) / DAY) : null);

export const STALE_RULES = { briefYellowDays: 60, briefRedDays: 90, contactGapDays: 30, activeStageGapDays: 14, freshSignalDays: 30, followUpDays: 3 };
const ACTIVE_STAGES = ["Connected", "Discovery", "Lane test / Quote"];
const HOT_WORDS = SIGNAL_KEYWORDS.concat(["expansion", "closing", "closure", "distribution center", "new plant", "relocat", "warehouse", "hiring", "freight", "carrier"]);

export function signalIsHot(s) {
  const t = `${s.title} ${s.summary || ""} ${s.category || ""}`.toLowerCase();
  return HOT_WORDS.some(w => t.includes(w));
}

export function openNextSteps(notes = []) {
  const out = [];
  for (const n of notes) for (const s of n.prn?.next || []) if (s.text && !s.done) out.push({ ...s, from: n.created_at, contact_id: n.contact_id, account_id: n.account_id });
  return out;
}

// Account-level: time (company profile age), event (new signals), activity (any touch on the account).
export function assess(account, signals = [], notes = []) {
  const reasons = [];
  let score = 0;
  const briefAge = daysSince(account.refreshed_at);
  let briefStatus = "fresh";
  if (briefAge == null || briefAge > STALE_RULES.briefRedDays) { briefStatus = "stale"; score += 2; reasons.push({ rule: "Time", text: briefAge == null ? "Profile never reviewed" : `Profile is ${briefAge} days old (over ${STALE_RULES.briefRedDays}). Refresh it.` }); }
  else if (briefAge > STALE_RULES.briefYellowDays) { briefStatus = "aging"; score += 1; reasons.push({ rule: "Time", text: `Profile is ${briefAge} days old (over ${STALE_RULES.briefYellowDays}).` }); }

  const fresh = signals.filter(s => s.status === "new" && daysSince(s.published_at || s.created_at) <= STALE_RULES.freshSignalDays);
  const hot = fresh.filter(signalIsHot);
  if (hot.length) { score += Math.min(3, hot.length + 1); reasons.push({ rule: "Event", text: `${hot.length} new freight signal${hot.length > 1 ? "s" : ""} to review: “${hot[0].title}”` }); }
  else if (fresh.length) { score += 1; reasons.push({ rule: "Event", text: `${fresh.length} new signal${fresh.length > 1 ? "s" : ""} found by the Exa watch.` }); }

  const gap = daysSince(account.last_touched_at);
  if (gap == null) { score += 2; reasons.push({ rule: "Activity", text: "No one has contacted this account yet." }); }
  else if (ACTIVE_STAGES.includes(account.stage) && gap > STALE_RULES.activeStageGapDays) { score += 2; reasons.push({ rule: "Activity", text: `${gap} days since the last touch on an active deal (over ${STALE_RULES.activeStageGapDays}).` }); }
  else if (gap > STALE_RULES.contactGapDays) { score += 1; reasons.push({ rule: "Activity", text: `${gap} days since the last touch (over ${STALE_RULES.contactGapDays}).` }); }

  const overdue = openNextSteps(notes).filter(n => n.due && new Date(n.due) < new Date());
  if (overdue.length) { score += 2; reasons.push({ rule: "Activity", text: `${overdue.length} next step${overdue.length > 1 ? "s are" : " is"} overdue: “${overdue[0].text}”` }); }

  const level = score >= 4 ? "red" : score >= 2 ? "yellow" : "green";
  return { level, label: { red: "Act now", yellow: "This week", green: "On track" }[level], score, reasons, briefAge, briefStatus, gap, hotSignals: hot };
}

// Person-level status: has this person been contacted, and what's next with them.
export function contactStatus(contact, notes = [], activity = []) {
  const mine = notes.filter(n => n.contact_id === contact.id);
  const sent = activity.filter(a => a.contact_id === contact.id && /^Sent/.test(a.action));
  const last = contact.last_touched_at;
  const gap = daysSince(last);
  const open = openNextSteps(mine);
  const overdue = open.filter(s => s.due && new Date(s.due) < new Date());
  let status, label;
  if (mine.length) { status = "engaged"; label = "Talked"; }
  else if (sent.length) { status = "contacted"; label = "Reached out"; }
  else { status = "new"; label = "Not contacted"; }
  const awaitingReply = status === "contacted" && gap != null && gap >= STALE_RULES.followUpDays;
  const briefAge = daysSince(contact.refreshed_at);
  return { status, label, gap, open, overdue, awaitingReply, briefAge, lastSent: sent[0]?.created_at };
}

export function contactNextSteps(contact, cs, account) {
  const who = contact.name?.split(" ")[0] || "them";
  const steps = [];
  for (const o of cs.overdue.slice(0, 1)) steps.push(`Overdue: ${o.text}${o.due ? ` (was due ${o.due})` : ""}`);
  for (const o of cs.open.filter(x => !cs.overdue.includes(x)).slice(0, 1)) steps.push(`${o.text}${o.due ? ` (due ${o.due})` : ""}`);
  if (cs.status === "new") { steps.push(`Send ${who} a CRVA email built on their Sharpest Signal.`); steps.push("Run a mock call before the first dial."); }
  if (cs.awaitingReply) steps.push(`No reply in ${cs.gap} days. Call ${who}, then send a LinkedIn note (under 200 characters).`);
  else if (cs.status === "contacted") steps.push(`Follow up by phone ${STALE_RULES.followUpDays} business days after the email.`);
  if (cs.status === "engaged") steps.push(account?.stage === "Discovery" ? "Confirm 2–3 lanes, volumes and equipment, then propose a lane test." : "Turn every inferred line in the brief into a question for the next call.");
  if (cs.briefAge != null && cs.briefAge > STALE_RULES.briefYellowDays) steps.push("Refresh this person's brief before the next call.");
  return [...new Set(steps)].slice(0, 4);
}

// Main Hub: ranked actions across all accounts and people.
export function hubActions(accounts) {
  const reach = [], follow = [], refresh = [], practice = [];
  for (const a of accounts) {
    const heat = a.assessment.score;
    if (a.assessment.hotSignals.length || a.assessment.briefStatus !== "fresh") refresh.push({ account: a, why: a.assessment.reasons.find(r => r.rule !== "Activity")?.text || "Review the profile." });
    for (const c of a.contacts) {
      const cs = c.cs;
      if (cs.status === "new") reach.push({ account: a, contact: c, rank: heat + (c.role_type === "Logistics" ? 2 : c.role_type === "Executive" ? 0 : 1), why: c.brief?.sharpest?.text || a.brief?.overview || "" });
      for (const o of cs.overdue) follow.push({ account: a, contact: c, rank: 10, why: `Overdue: ${o.text}`, due: o.due });
      for (const o of cs.open.filter(x => !cs.overdue.includes(x))) follow.push({ account: a, contact: c, rank: 5, why: o.text, due: o.due });
      if (cs.awaitingReply) follow.push({ account: a, contact: c, rank: 7, why: `No reply ${cs.gap} days after your email. Call, then send a LinkedIn note.` });
      if (cs.status !== "engaged" && !(c.bestScore >= 80)) practice.push({ account: a, contact: c, why: c.bestScore != null ? `Best score ${c.bestScore}/100. Aim for 80+.` : "Not practiced yet." });
    }
  }
  const byRank = (x, y) => y.rank - x.rank;
  return { reach: reach.sort(byRank), follow: follow.sort(byRank), refresh, practice };
}
