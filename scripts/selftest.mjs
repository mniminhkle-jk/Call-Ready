import { SEED_ACCOUNTS } from "../lib/seed.js";
import { buildEmail, buildLinkedIn, connectOptions, callChecklist } from "../lib/crva.js";
import { scoreCall, parseTranscript } from "../lib/score.js";
import { assess, nextSteps } from "../lib/rules.js";
import { briefMarkdown } from "../lib/compose.js";
import { briefDocx } from "../lib/docx.js";
import { summaryToPRN } from "../lib/integrations.js";
import { buildPersona } from "../lib/persona.js";
import fs from "fs";
const out = process.argv[2];
for (const a of SEED_ACCOUNTS) {
  const acct = { ...a, refreshed_at: new Date().toISOString(), last_touched_at: null };
  const c = a.contacts[1], ceo = a.contacts[0];
  const e = buildEmail(acct, ceo, { connectId: "hook0", driver: "RISK" });
  const li = buildLinkedIn(acct, c);
  const li2 = buildLinkedIn(acct, ceo, { connectId: "hook0" });
  console.log(`\n=== ${a.name}\nSUBJECT: ${e.subject}\n${e.body}\nLI(${li.length}): ${li.text}\nLI-CEO(${li2.length}): ${li2.text}`);
  const as = assess(acct, a.signals.map(s => ({ ...s, status: "new" })), []);
  console.log("ASSESS:", as.level, as.reasons.map(r => r.text));
  console.log("NEXT:", nextSteps(acct, as, a.contacts, []));
  const p = buildPersona(acct, { ...c, id: "abc" }, "Book a 15-minute discovery meeting", "busy");
  console.log("PERSONA:", p.persona_name, p.persona_title, p.company_context.length);
  const ctx = { signals: a.signals, notes: [{ created_at: new Date().toISOString(), prn: { results: { quantify: "About 40 flatbed loads a week in April." }, next: [{ text: "Send lane review", due: "2026-10-24" }] } }], contacts: a.contacts };
  fs.writeFileSync(`${out}/${a.id}.md`, briefMarkdown(acct, ctx));
  fs.writeFileSync(`${out}/${a.id}.docx`, await briefDocx(acct, ctx));
}
const a = SEED_ACCOUNTS[0];
const t = parseTranscript(null, `Agent: Dana speaking.
User: Hi Dana, thanks for taking my call. I saw Trex inventory started landing at your DCs in September. How's that going?
Agent: Busy. What's this about?
User: I'm calling because we move flatbed freight for building products distributors on new supplier lanes.
Agent: We have carriers.
User: I know you run your own fleet for dealer deliveries. What I don't know is who covers inbound Trex loads?
Agent: Mostly outside carriers.
User: Which lanes go to outside carriers first when volume spikes?
Agent: Fernley into Little Rock and Memphis.
User: How far ahead do you book flatbed capacity for spring?
Agent: A few weeks, sometimes less.
User: We can back up those lanes so a dropped load doesn't empty a DC, and cut cost per load during peak.
Agent: Maybe.
User: Would you be open to a 15-minute call next Tuesday or Thursday to look at two lanes?
Agent: Tuesday works.`);
const s = scoreCall(t, a);
console.log("\nSCORE:", s.total, s.band, s.items.map(i => `${i.id}:${i.status}`).join(" "), "talk", s.talkRatio);
console.log("FEEDBACK:", s.feedback);
const weak = scoreCall(parseTranscript(null, "Agent: Hello.\nUser: Hi, want to buy freight services?\nAgent: No.\nUser: Ok bye."), a);
console.log("WEAK:", weak.total, weak.feedback.length);
console.log("\nPRN:", JSON.stringify(summaryToPRN({ title: "Intro call with BlueLinx transportation", summary: "## Notes\n- They currently use 6 core carriers plus their own fleet\n- About 40 flatbed loads per week out of Nashville in April\n- Problem: carriers rejected tenders during spring peak\n- If this continues they lose dealer orders\n- Want a backup for Fernley lanes\n## Next steps\n- Send lane review by Friday\n- Schedule follow-up with DC manager" }), null, 1));
console.log(callChecklist(a, a.contacts[1]).map(x => x.part).join(""));
