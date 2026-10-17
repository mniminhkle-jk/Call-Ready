// Builds the one-page PERSON brief (profile view, .docx export, markdown in GitHub).
// Merges the curated person brief with the company's latest signals and this person's PRN notes, removing duplicates.

export function composeBrief(account, contact, { signals = [], notes = [] } = {}) {
  const b = contact.brief || {};
  const seen = new Set();
  const uniq = (arr, key) => arr.filter(x => { const k = String(key(x) || "").toLowerCase().trim(); if (!k || seen.has(k)) return false; seen.add(k); return true; });
  const recent = uniq(signals.filter(s => s.status !== "dismissed").sort((x, y) => new Date(y.published_at || y.created_at) - new Date(x.published_at || x.created_at)), s => s.url).slice(0, 3);
  const learnings = [], nextSteps = [];
  for (const n of [...notes].filter(n => n.contact_id === contact.id).sort((x, y) => new Date(y.created_at) - new Date(x.created_at))) {
    for (const [k, v] of Object.entries(n.prn?.results || {})) if (v) learnings.push({ k, text: v, date: n.created_at });
    for (const s of n.prn?.next || []) if (s.text && !s.done) nextSteps.push(s);
  }
  return {
    name: contact.name || "Name not on file",
    title: contact.title,
    company: account.name,
    header: [contact.title, account.name, contact.location].filter(Boolean).join(" · "),
    since: contact.since,
    phones: contact.phones || [],
    email: contact.email,
    direct: contact.phone,
    linkedin: contact.linkedin_url,
    refreshed: contact.refreshed_at,
    stage: account.stage,
    sharpest: b.sharpest,
    career: contact.career || [],
    known: b.known || [],
    cares: b.cares || [],
    companyFacts: (account.brief?.facts || []).slice(0, 3),
    recent,
    openers: (b.openers || []).slice(0, 3),
    questions: (b.questions || []).slice(0, 3),
    talkTrack: b.talkTrack,
    learnings: uniq(learnings, l => l.text).slice(0, 4),
    nextSteps: uniq(nextSteps, s => s.text).slice(0, 3),
    sources: b.sources || [],
  };
}

const tag = l => (l.tag === "verified" ? `✓${l.src ? `[${l.src}]` : ""}` : "?inferred");

export function briefMarkdown(account, contact, ctx) {
  const c = composeBrief(account, contact, ctx);
  const L = [];
  L.push(`# ${c.name}`);
  L.push(`${c.header}${c.since ? ` · in role since ${c.since}` : ""}  \nAccount stage: **${c.stage}** · Brief reviewed: ${c.refreshed ? new Date(c.refreshed).toISOString().slice(0, 10) : "never"}`);
  L.push(`\n**Contact:** ${c.phones.map(p => `${p.label}: ${p.number}`).join(" · ")}${c.direct ? ` · Direct (CRM): ${c.direct}` : ""}${c.email ? ` · Email (CRM): ${c.email}` : " · Email: add from CRM"}${c.linkedin ? ` · [LinkedIn](${c.linkedin})` : ""}`);
  if (c.sharpest) L.push(`\n> **Sharpest Signal** ${c.sharpest.text} ${(c.sharpest.src || []).map(n => `[${n}]`).join("")}\n>\n> *Why it gets the call:* ${c.sharpest.why}`);
  L.push(`\n## Who they are`);
  for (const r of c.career) L.push(`- **${r.title}**, ${r.org} (${r.years})${r.note ? `: ${r.note}` : ""}`);
  L.push(`\n## What we know`);
  for (const l of c.known) L.push(`- ${l.text} ${tag(l)}`);
  if (c.cares.length) L.push(`\n**Likely cares about:** ${c.cares.join(" · ")}`);
  if (c.recent.length) { L.push(`\n## Company signals`); for (const s of c.recent) L.push(`- ${String(s.published_at || "").slice(0, 10)} · ${s.title} ([source](${s.url}))`); }
  L.push(`\n## Openers (CRVA)`);
  for (const o of c.openers) L.push(`- *${o.driver}:* “${o.text}”`);
  L.push(`\n## Questions: “I know ___ / I don't know ___”`);
  for (const q of c.questions) L.push(`- ${q.know} ${q.dontKnow}  \n  Follow-ons: ${q.ladder.join(" → ")}`);
  if (c.talkTrack) L.push(`\n## Talk track\n- **C** ${c.talkTrack.C}\n- **R** ${c.talkTrack.R}\n- **V** GET: ${c.talkTrack.V.GET} / PAIN: ${c.talkTrack.V.PAIN} / RISK: ${c.talkTrack.V.RISK}\n- **A** ${c.talkTrack.A}`);
  if (c.learnings.length || c.nextSteps.length) {
    L.push(`\n## From past calls (PRN)`);
    for (const l of c.learnings) L.push(`- ${l.k}: ${l.text}`);
    for (const s of c.nextSteps) L.push(`- Next: ${s.text}${s.due ? ` (due ${s.due})` : ""}`);
  }
  L.push(`\n## Sources`);
  for (const s of c.sources) L.push(`${s.n}. [${s.title}](${s.url}) (${s.date})`);
  L.push(`\n✓ = verified with a numbered source · ?inferred = a flagged guess. Ask about it, don't state it.`);
  return L.join("\n");
}
