// Builds the one-page brief (used by the profile, the .docx export and the markdown files in GitHub).
// Merges the curated brief with live signals and PRN notes, removing duplicates.

export function composeBrief(account, { signals = [], notes = [], contacts = [] } = {}) {
  const b = account.brief || {};
  const seen = new Set();
  const uniq = (arr, key) => arr.filter(x => { const k = key(x).toLowerCase().trim(); if (!k || seen.has(k)) return false; seen.add(k); return true; });

  const recent = uniq(
    signals.filter(s => s.status !== "dismissed").sort((a, b2) => new Date(b2.published_at || b2.created_at) - new Date(a.published_at || a.created_at)),
    s => s.url
  ).slice(0, 3);

  // Latest call learnings: newest first, de-duplicated by text across notes.
  const learnings = [];
  const nextSteps = [];
  for (const n of [...notes].sort((a, c) => new Date(c.created_at) - new Date(a.created_at))) {
    const r = n.prn?.results || {};
    for (const [k, v] of Object.entries(r)) if (v) learnings.push({ k, text: v, date: n.created_at });
    for (const s of n.prn?.next || []) if (s.text && !s.done) nextSteps.push(s);
  }
  const learningsU = uniq(learnings, l => l.text).slice(0, 4);
  const nextU = uniq(nextSteps, s => s.text).slice(0, 3);

  return {
    title: account.name,
    header: [account.segment, account.hq, account.ticker].filter(Boolean).join(" · "),
    stage: account.stage,
    refreshed: account.refreshed_at,
    oneLiner: b.oneLiner,
    sharpest: b.sharpest,
    freight: b.freight || {},
    company: b.company || [],
    recent,
    who: contacts.slice(0, 3).map(c => ({ name: c.name, title: c.title, why: c.why })),
    openers: (b.openers || []).slice(0, 3),
    questions: (b.questions || []).slice(0, 3),
    talkTrack: b.talkTrack,
    learnings: learningsU,
    nextSteps: nextU,
    sources: b.sources || [],
  };
}

const tag = l => (l.tag === "verified" ? `✓${l.src ? `[${l.src}]` : ""}` : "?inferred");

export function briefMarkdown(account, ctx) {
  const c = composeBrief(account, ctx);
  const L = [];
  L.push(`# ${c.title}`);
  L.push(`${c.header}  \nStage: **${c.stage}** · Brief reviewed: ${c.refreshed ? new Date(c.refreshed).toISOString().slice(0, 10) : "never"}`);
  L.push(`\n${c.oneLiner || ""}`);
  if (c.sharpest) L.push(`\n> **Sharpest Signal** ${c.sharpest.text} ${(c.sharpest.src || []).map(n => `[${n}]`).join("")}\n>\n> *Why it gets the call:* ${c.sharpest.why}`);
  L.push(`\n## Freight profile`);
  const sec = { ships: "What they ship", where: "Where", when: "How often / when", who: "Who moves it today" };
  for (const [k, label] of Object.entries(sec)) for (const l of c.freight[k] || []) L.push(`- **${label}:** ${l.text} ${tag(l)}`);
  if (c.company.length) {
    L.push(`\n## Company now`);
    for (const l of c.company) L.push(`- ${l.text} ${tag(l)}`);
  }
  if (c.recent.length) {
    L.push(`\n## Recent signals`);
    for (const s of c.recent) L.push(`- ${s.published_at ? String(s.published_at).slice(0, 10) : ""} · ${s.title} ([source](${s.url}))`);
  }
  L.push(`\n## Who to call`);
  for (const w of c.who) L.push(`- **${w.name ? `${w.name}, ` : ""}${w.title}**: ${w.why || ""}`);
  L.push(`\n## Openers (CRVA)`);
  for (const o of c.openers) L.push(`- *${o.driver}:* “${o.text}”`);
  L.push(`\n## Questions: “I know ___ / I don't know ___”`);
  for (const q of c.questions) L.push(`- ${q.know} ${q.dontKnow}  \n  Follow-ons: ${q.ladder.join(" → ")}`);
  if (c.talkTrack) {
    L.push(`\n## Talk track`);
    L.push(`- **C** ${c.talkTrack.C}\n- **R** ${c.talkTrack.R}\n- **V** GET: ${c.talkTrack.V.GET} / PAIN: ${c.talkTrack.V.PAIN} / RISK: ${c.talkTrack.V.RISK}\n- **A** ${c.talkTrack.A}`);
  }
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
