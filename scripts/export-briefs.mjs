// Writes briefs/<account>.md from lib/seed.js. Run after editing the seed: `npm run briefs`. Each refresh is a git commit.
import fs from "fs";
import { SEED_ACCOUNTS, RESEARCHED_ON } from "../lib/seed.js";
import { briefMarkdown } from "../lib/compose.js";
fs.mkdirSync("briefs", { recursive: true });
for (const a of SEED_ACCOUNTS) {
  const acct = { ...a, refreshed_at: RESEARCHED_ON + "T17:30:00-05:00" };
  const md = briefMarkdown(acct, { signals: a.signals.map(s => ({ ...s, status: "reviewed" })), notes: [], contacts: a.contacts });
  const extra = `\n\n---\n**Research log:** agent ${a.brief.research.agentMinutes} min · human review ${a.brief.research.reviewMinutes} min\n\nWhere the agent fell short:\n${a.brief.research.gaps.map(g => `- ${g}`).join("\n")}\n`;
  fs.writeFileSync(`briefs/${a.id}.md`, md + extra);
  console.log("wrote", `briefs/${a.id}.md`);
}
