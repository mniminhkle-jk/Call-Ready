// Rule-based staleness, criticality and next steps. No AI: every flag shows the rule that fired.
import { SIGNAL_KEYWORDS } from "./seed";

const DAY = 864e5;
export const daysSince = d => (d ? Math.floor((Date.now() - new Date(d).getTime()) / DAY) : null);

export const STALE_RULES = {
  briefYellowDays: 60,
  briefRedDays: 90,
  contactGapDays: 30,
  activeStageGapDays: 14,
  freshSignalDays: 30,
};

const ACTIVE_STAGES = ["Connected", "Discovery", "Lane test / Quote"];
const HOT_WORDS = SIGNAL_KEYWORDS.concat(["expansion", "closing", "closure", "distribution center", "new plant", "relocat", "warehouse", "hiring", "freight", "carrier"]);

export function signalIsHot(s) {
  const t = `${s.title} ${s.summary || ""} ${s.category || ""}`.toLowerCase();
  return HOT_WORDS.some(w => t.includes(w));
}

export function assess(account, signals = [], notes = []) {
  const reasons = [];
  let score = 0;

  // Time trigger: brief age
  const briefAge = daysSince(account.refreshed_at);
  let briefStatus = "fresh";
  if (briefAge == null || briefAge > STALE_RULES.briefRedDays) {
    briefStatus = "stale"; score += 2;
    reasons.push({ rule: "Time", text: briefAge == null ? "Brief has never been reviewed" : `Brief is ${briefAge} days old (over ${STALE_RULES.briefRedDays}). Refresh before the next call.` });
  } else if (briefAge > STALE_RULES.briefYellowDays) {
    briefStatus = "aging"; score += 1;
    reasons.push({ rule: "Time", text: `Brief is ${briefAge} days old (over ${STALE_RULES.briefYellowDays}).` });
  }

  // Event trigger: fresh, freight-relevant signals the team hasn't reviewed
  const fresh = signals.filter(s => s.status === "new" && daysSince(s.published_at || s.created_at) <= STALE_RULES.freshSignalDays);
  const hot = fresh.filter(signalIsHot);
  if (hot.length) {
    score += Math.min(3, hot.length + 1);
    reasons.push({ rule: "Event", text: `${hot.length} new freight signal${hot.length > 1 ? "s" : ""} to review: “${hot[0].title}”` });
  } else if (fresh.length) {
    score += 1;
    reasons.push({ rule: "Event", text: `${fresh.length} new signal${fresh.length > 1 ? "s" : ""} found by the Exa watch.` });
  }

  // Activity trigger: contact gap
  const gap = daysSince(account.last_touched_at);
  if (gap == null) {
    score += 2;
    reasons.push({ rule: "Activity", text: "No logged touch yet. First outreach is still open." });
  } else if (ACTIVE_STAGES.includes(account.stage) && gap > STALE_RULES.activeStageGapDays) {
    score += 2;
    reasons.push({ rule: "Activity", text: `${gap} days since the last touch on an active deal (over ${STALE_RULES.activeStageGapDays}).` });
  } else if (gap > STALE_RULES.contactGapDays) {
    score += 1;
    reasons.push({ rule: "Activity", text: `${gap} days since the last touch (over ${STALE_RULES.contactGapDays}).` });
  }

  // Overdue next steps from PRN notes
  const overdue = openNextSteps(notes).filter(n => n.due && new Date(n.due) < new Date());
  if (overdue.length) {
    score += 2;
    reasons.push({ rule: "Activity", text: `${overdue.length} next step${overdue.length > 1 ? "s are" : " is"} overdue: “${overdue[0].text}”` });
  }

  const level = score >= 4 ? "red" : score >= 2 ? "yellow" : "green";
  const label = { red: "Act now", yellow: "This week", green: "On track" }[level];
  return { level, label, score, reasons, briefAge, briefStatus, gap, hotSignals: hot };
}

export function openNextSteps(notes = []) {
  const out = [];
  for (const n of notes) for (const s of n.prn?.next || []) if (s.text && !s.done) out.push({ ...s, from: n.created_at });
  return out;
}

export function nextSteps(account, assessment, contacts = [], notes = []) {
  const steps = [];
  const logistics = contacts.find(c => c.role_type === "Logistics") || contacts[0];
  const who = logistics ? (logistics.name || logistics.title) : "the logistics lead";
  for (const s of assessment.hotSignals.slice(0, 1)) steps.push(`Review the new signal “${s.title}” and decide if it changes the Sharpest Signal.`);
  if (assessment.briefStatus !== "fresh") steps.push("Refresh the brief: run the Exa signal check, then mark the brief reviewed.");
  const open = openNextSteps(notes).slice(0, 2);
  for (const o of open) steps.push(`${o.text}${o.due ? ` (due ${o.due})` : ""}`);
  switch (account.stage) {
    case "Research":
      steps.push(`Send a CRVA email to ${who} built on the Sharpest Signal.`);
      steps.push("Practice the opener with a mock call before dialing.");
      break;
    case "Outreach":
      steps.push(`Follow up by phone with ${who} within 3 business days of the email.`);
      steps.push("Send a LinkedIn note (under 200 characters) as a second touch.");
      break;
    case "Connected":
      steps.push("Book a discovery call and enter its Purpose (P of PRN) before the meeting.");
      break;
    case "Discovery":
      steps.push("Confirm 2–3 lanes, volumes and equipment (Quantify), then propose a lane test.");
      steps.push("Turn every inferred line in the brief into a question for the next call.");
      break;
    case "Lane test / Quote":
      steps.push("Send the lane-test quote and agree on the success measure (on-time %, tender acceptance).");
      break;
    case "Active shipper":
      steps.push("Schedule a quarterly review and ask which new lanes are coming.");
      break;
    default:
      steps.push("Set a re-engagement date tied to the next freight signal.");
  }
  return [...new Set(steps)].slice(0, 5);
}
