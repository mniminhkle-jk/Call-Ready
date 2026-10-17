import { Document, Packer, Paragraph, TextRun, ShadingType, BorderStyle, TabStopType } from "docx";
import { composeBrief } from "./compose";

const FONT = "Calibri";
const NAVY = "16324F", MUTED = "5A6878", AMBER = "B86E12";
const run = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size || 17, bold: o.bold, italics: o.italics, color: o.color });
const para = (children, o = {}) => new Paragraph({ children, spacing: { before: o.before ?? 0, after: o.after ?? 30, line: 228 }, ...o.extra });
const head = text => para([run(text.toUpperCase(), { bold: true, size: 16, color: NAVY })], { before: 70, after: 20, extra: { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D5DBE2", space: 1 } } } });
const bullet = children => new Paragraph({ children, bullet: { level: 0 }, spacing: { after: 10, line: 220 } });
const tagRun = l => (l.tag === "verified" ? run(` ✓${l.src || ""}`, { size: 14, color: "1F7A4D", bold: true }) : run(" ?inferred", { size: 14, color: AMBER, bold: true }));

// One-page person brief.
export async function briefDocx(account, contact, ctx) {
  const c = composeBrief(account, contact, ctx);
  const kids = [];
  kids.push(new Paragraph({ children: [run(c.name, { bold: true, size: 30, color: NAVY }), run(`\t${c.company} · ${account.segment || ""}`, { size: 16, color: MUTED })], tabStops: [{ type: TabStopType.RIGHT, position: 11000 }], spacing: { after: 10 } }));
  kids.push(para([run(`${c.title}${contact.location ? ` · ${contact.location}` : ""}${c.since ? ` · in role since ${c.since}` : ""}`, { size: 18 })], { after: 20 }));
  const contactBits = [...c.phones.map(p => `${p.label}: ${p.number}`), c.direct ? `Direct (CRM): ${c.direct}` : "Direct line: add from CRM", c.email ? `Email (CRM): ${c.email}` : "Email: add from CRM", c.linkedin ? `LinkedIn: ${c.linkedin.replace(/^https?:\/\/(www\.)?/, "")}` : ""].filter(Boolean);
  kids.push(para([run(contactBits.join("  ·  "), { size: 14, color: MUTED })], { after: 30 }));
  kids.push(para([run(`Account stage: ${c.stage}  ·  Brief reviewed ${c.refreshed ? new Date(c.refreshed).toISOString().slice(0, 10) : "never"}  ·  ✓ = verified with numbered source, ?inferred = ask about it, don't state it`, { size: 13, color: MUTED })], { after: 40 }));

  if (c.sharpest) {
    kids.push(new Paragraph({ children: [run("SHARPEST SIGNAL  ", { bold: true, color: AMBER, size: 16 }), run(c.sharpest.text), run(` [${(c.sharpest.src || []).join(",")}]`, { size: 14, color: MUTED })], shading: { type: ShadingType.CLEAR, color: "auto", fill: "FDF3E4" }, border: { left: { style: BorderStyle.SINGLE, size: 18, color: AMBER, space: 4 } }, spacing: { after: 20, line: 228 } }));
    kids.push(para([run("Why it gets the call: ", { bold: true, size: 15 }), run(c.sharpest.why, { size: 15, italics: true })], { after: 30 }));
  }
  kids.push(head("Who they are"));
  for (const r of c.career.slice(0, 4)) kids.push(bullet([run(`${r.title}, ${r.org} `, { bold: true }), run(`(${r.years})${r.note ? `: ${r.note}` : ""}`)]));
  kids.push(head("What we know"));
  for (const l of c.known.slice(0, 6)) kids.push(bullet([run(l.text), tagRun(l)]));
  if (c.cares.length) kids.push(para([run("Likely cares about: ", { bold: true, size: 15 }), run(c.cares.join(" · "), { size: 15 })], { before: 20 }));
  if (c.recent.length) { kids.push(head("Company signals")); for (const s of c.recent) kids.push(bullet([run(`${String(s.published_at || "").slice(0, 10)}  `, { color: MUTED, size: 15 }), run(s.title)])); }
  kids.push(head("Openers (CRVA)"));
  for (const o of c.openers) kids.push(bullet([run(`${o.driver}  `, { bold: true, color: AMBER, size: 15 }), run(`“${o.text}”`)]));
  kids.push(head("Questions: I know ___ / I don't know ___"));
  for (const q of c.questions) kids.push(bullet([run(`${q.know} ${q.dontKnow} `), run(`→ ${q.ladder[0]}`, { color: MUTED, size: 15 })]));
  if (c.talkTrack) {
    kids.push(head("Talk track"));
    kids.push(bullet([run("C ", { bold: true }), run(c.talkTrack.C)]));
    kids.push(bullet([run("R ", { bold: true }), run(c.talkTrack.R)]));
    kids.push(bullet([run("V ", { bold: true }), run(`PAIN: ${c.talkTrack.V.PAIN}  RISK: ${c.talkTrack.V.RISK}`)]));
    kids.push(bullet([run("A ", { bold: true }), run(c.talkTrack.A)]));
  }
  if (c.learnings.length || c.nextSteps.length) {
    kids.push(head("From past calls (PRN, newest first, no duplicates)"));
    for (const l of c.learnings.slice(0, 3)) kids.push(bullet([run(`${cap(l.k)}: `, { bold: true }), run(l.text)]));
    for (const s of c.nextSteps.slice(0, 2)) kids.push(bullet([run("Next: ", { bold: true }), run(`${s.text}${s.due ? ` (due ${s.due})` : ""}`)]));
  }
  kids.push(head("Sources"));
  kids.push(para(c.sources.map((s, i) => run(`${i ? "   " : ""}${s.n}. ${s.title} (${s.date}) ${s.url}`, { size: 12, color: MUTED })), { after: 0 }));
  const doc = new Document({ creator: "Call Ready", title: `${c.name}: prospect brief`, styles: { default: { document: { run: { font: FONT, size: 17 } } } }, sections: [{ properties: { page: { margin: { top: 500, bottom: 450, left: 600, right: 600 } } }, children: kids }] });
  return Packer.toBuffer(doc);
}
const cap = s => ({ clarify: "Clarify", quantify: "Quantify", process: "Process", progress: "Progress", problem: "Problem", implication: "Implication", needsPayoff: "Needs-payoff" }[s] || s);
