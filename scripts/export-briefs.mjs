// Writes briefs/<company>/<person>.md and briefs/<company>/company.md from lib/seed.js. Each refresh is a git commit.
import fs from "fs";
import { SEED_ACCOUNTS, RESEARCHED_ON } from "../lib/seed.js";
import { briefMarkdown } from "../lib/compose.js";
import { briefDocx } from "../lib/docx.js";
const docxOut = process.argv[2];
for (const a of SEED_ACCOUNTS) {
  const dir = `briefs/${a.id}`; fs.mkdirSync(dir, { recursive: true });
  const acct = { ...a, refreshed_at: RESEARCHED_ON + "T17:30:00-05:00" };
  const b = a.brief;
  const company = [`# ${a.name}`, `${a.segment} · ${a.hq} · ${a.ticker}`, "", b.overview, "", `**Address:** ${b.address}`, `**Phones:** ${a.phones.map(p => `${p.label}: ${p.number}`).join(" · ")}`, "", "## What we found", ...b.facts.map(f => `- **${f.label}:** ${f.text} [${f.src}]`), "", "## Freight facts", ...b.freight.map(f => `- **${f.label}:** ${f.text} [${f.src}]`), "", "## Locations", ...b.locations.map(l => `- ${l.text} [${l.src}]`), "", "## Contacts", ...a.contacts.map(c => `- [${c.name}, ${c.title}](./${c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md)`), "", "## Sources", ...b.sources.map(s => `${s.n}. [${s.title}](${s.url}) (${s.date})`)].join("\n");
  fs.writeFileSync(`${dir}/company.md`, company + "\n");
  for (const c of a.contacts) {
    const contact = { ...c, id: c.name, refreshed_at: acct.refreshed_at };
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const ctx = { signals: a.signals.map(s => ({ ...s, status: "reviewed" })), notes: [] };
    fs.writeFileSync(`${dir}/${slug}.md`, briefMarkdown(acct, contact, ctx) + `\n\n---\n**Research log:** agent ${c.brief.research.agentMinutes} min · human review ${c.brief.research.reviewMinutes} min\n${c.brief.research.gaps.map(g => `- ${g}`).join("\n")}\n`);
    if (docxOut) { fs.mkdirSync(docxOut, { recursive: true }); fs.writeFileSync(`${docxOut}/${a.name.replace(/[^A-Za-z]+/g, "")}-${c.name.replace(/\s+/g, "-")}.docx`, await briefDocx(acct, contact, ctx)); }
  }
  console.log("wrote", dir);
}
