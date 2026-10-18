// Call Ready guide: a rule-based helper that suggests what you probably need on the current screen.
// Plain DOM code (no framework) so the same file runs in the app and in the clickable preview.

const KB = [
  // Main Hub
  { id: "call-first", ctx: ["hub"], q: "Who should I call first?", kw: "call first who start today priority reach", a: () => { const n = document.querySelector("[data-guide='top-reach']"); return n ? `Start with ${n.textContent.trim()}. They're at the top of “Reach out today” because their company has fresh signals and they own carrier decisions.` : "Start at the top of “Reach out today.” It's ranked by fresh company signals and role fit."; }, act: [{ label: "Open top contact", click: "top-reach" }] },
  { id: "quota", ctx: ["hub", "dash"], q: "How is my quota tracking?", kw: "quota margin attainment target pace numbers", a: "Your margin for the month is on the first card of the Main Hub. Dashboards breaks it down by rep, month and pipeline stage.", act: [{ label: "Open Dashboards", href: "/dashboards" }] },
  { id: "follow", ctx: ["hub"], q: "What goes in “Follow up”?", kw: "follow up overdue next step due reply", a: "Next steps from your call notes, plus emails with no reply after 3 days. Overdue items come first. The list shows at the top of the Main Hub when something is due." },
  { id: "news", ctx: ["hub", "account"], q: "What's a good reason to call?", kw: "reason why call news update signal now", a: "Fresh company news: a new plant, a closure, new lanes or logistics hiring. The newest item per company is under “Reasons to call this week” on the Main Hub and “Company news” on each company page." },
  // Accounts
  { id: "find-role", ctx: ["accounts"], q: "Find someone by role", kw: "find search role title logistics transportation filter", a: "Type a title like “transportation” in the search box, or pick a Position filter. Click a name to open their profile.", act: [{ label: "Focus search", click: "search" }] },
  { id: "add-company", ctx: ["accounts"], q: "Add a new company", kw: "add new company account create", a: "Add a company name and the portal searches public sources from the last 90 days for facility news, expansions and logistics hiring.", act: [{ label: "Add a company", href: "/new" }] },
  { id: "labels", ctx: ["accounts", "account", "hub"], q: "What do the colored labels mean?", kw: "label color red yellow green act now this week on track criticality", a: "Red (Act now), yellow (This week) and green (On track) come from three rules: how old the research is, new company news nobody has reviewed, and how long since anyone reached out." },
  // Company
  { id: "who-here", ctx: ["account"], q: "Who should I contact here?", kw: "who contact person here best", a: () => { const n = document.querySelector(".person-card .nm"); return n ? `Logistics and transportation leaders own carrier decisions. Start with ${n.textContent.trim()}, then go up to the executive for a referral if needed.` : "Start with the logistics or transportation leader; they own carrier decisions."; }, act: [{ label: "Open first contact", click: "first-contact" }] },
  { id: "sources", ctx: ["account", "contact"], q: "Where does this information come from?", kw: "source where from verified trust accurate", a: "Public sources only: company sites, SEC filings, press releases, trade press, job postings and public LinkedIn profiles. Each fact has a numbered source. Nothing comes from behind a login." },
  { id: "add-contact", ctx: ["account"], q: "Add a contact", kw: "add contact new person create", a: "Use “Add contact” under Contacts. Phone and email can stay blank; they fill in from Salesforce or HubSpot, or you can add them later.", act: [{ label: "Add contact", click: "add-contact" }] },
  { id: "stale", ctx: ["account", "contact"], q: "When is a profile out of date?", kw: "stale out of date old refresh update when", a: "After 60 days it turns yellow and after 90 days red. It also flags new company news from the last 30 days that nobody has reviewed.", act: [{ label: "Check for news", click: "run-exa" }] },
  // Contact
  { id: "email", ctx: ["contact"], q: "Write an email to this person", kw: "email write draft message outreach crva", a: "The draft follows CRVA (Connect, Reason, Value, Ask) and shows where every line came from. Edit it, then send from your own email. Nothing sends automatically.", act: [{ label: "Draft email", click: "draft-email" }] },
  { id: "linkedin", ctx: ["contact"], q: "Send a LinkedIn note", kw: "linkedin note connect message 200", a: "LinkedIn notes stay under 200 characters: a short Connect, one line of value, and a yes/no ask.", act: [{ label: "Draft LinkedIn note", click: "draft-linkedin" }] },
  { id: "log", ctx: ["contact"], q: "Log my call notes", kw: "log notes call prn cqpppin record meeting granola", a: "Notes use PRN. P is the purpose. R is what you learned, sorted into Clarify, Quantify, Process, Progress, Problem, Implication and Needs-payoff. N is next steps with dates and owners. You need at least 3 of the 7 R items to save.", act: [{ label: "Log a call", click: "log-call-top" }] },
  { id: "practice", ctx: ["contact", "hub"], q: "Practice this call", kw: "practice mock call rehearse voice role play", a: "A practice call puts you on the phone with an AI version of this person, built from their brief. You get a score out of 100 against the CRVA checklist.", act: [{ label: "Start a practice call", click: "mock-call" }] },
  { id: "brief", ctx: ["contact"], q: "Download their one-page brief", kw: "download brief docx word one page print", a: "The brief is one page: Sharpest Signal, who they are, openers, questions and talk track, plus your latest call notes.", act: [{ label: "Download brief", click: "brief-docx" }] },
  { id: "inferred", ctx: ["contact", "account"], q: "What does “inferred” mean?", kw: "inferred verified guess label meaning", a: "Verified lines have a numbered source. Inferred lines are educated guesses. Ask about them on the call (“I know ___. What I don't know is ___.”) instead of stating them." },
  { id: "contact-info", ctx: ["contact"], q: "Why is the phone or email blank?", kw: "phone email blank missing number contact info", a: "Direct lines and emails aren't public, so they're left blank until they come in from Salesforce or HubSpot or a rep adds them. Personal numbers are never stored.", act: [{ label: "Add contact info", click: "edit-contact" }] },
  // Mock
  { id: "score", ctx: ["mock", "training"], q: "How is my call scored?", kw: "score scored rubric points grade readiness", a: "100 points: Connect 20, Reason 15, “I know” question 15, follow-ups three deep 15, Value 20, yes/no Ask 15. 80 or more means you're ready for the real call." },
  { id: "cost", ctx: ["mock"], q: "Is there a limit on voice practice?", kw: "cost price budget credit money minutes limit long", a: "Each voice call stops at 5 minutes. If the team's practice budget runs out, voice calls pause and written practice still works." },
  { id: "nomic", ctx: ["mock"], q: "I don't have a microphone", kw: "no mic microphone written paste transcript", a: "Role-play with a teammate and paste the lines under “Score a written practice.” It's scored the same way.", act: [{ label: "Go to written practice", click: "written-practice" }] },
  // Training / dashboards
  { id: "next-practice", ctx: ["training"], q: "Who should I practice next?", kw: "next practice who which contact", a: "“Practice next” lists the people you haven't practiced with yet or scored under 80 with. Start at the top.", act: [{ label: "Practice the first one", href: "#next" }] },
  { id: "improve", ctx: ["training"], q: "How do I improve my score?", kw: "improve better higher score tips weakest", a: "Check which move has the most ✕ marks. Most reps lose points on follow-up depth: pick one topic and ask three follow-ups in a row before moving to value." },
  { id: "numbers", ctx: ["dash"], q: "Where do these numbers come from?", kw: "numbers data where from salesforce hubspot crm source", a: "Margin, deals and quota come from your CRM (Salesforce or HubSpot). This prototype shows the portal's own database." },
  { id: "pace", ctx: ["dash"], q: "What does “on pace” mean?", kw: "pace on track behind ahead", a: () => { const d = new Date().getDate(); return `On pace means your margin so far is at least the share of the month that's gone by. On day ${d} of 31, that's ${Math.round(100 * d / 31)}% of quota.`; } },
  // Global
  { id: "crm", ctx: ["*"], q: "Does this sync with Salesforce or HubSpot?", kw: "salesforce hubspot crm sync export import", a: "Yes. Companies, contacts, deals and notes all have Salesforce and HubSpot IDs. Stage changes and email activity from the CRM show up in each account's Activity." },
  { id: "save", ctx: ["*"], q: "How are notes and briefs saved?", kw: "save saved history shared format team", a: "Everything is saved to the shared account record, so the next rep picks up where you left off. Notes are never overwritten, and every brief edit keeps the previous version." },
  { id: "wrong", ctx: ["*"], q: "Can the research be wrong?", kw: "wrong mistake error ai accurate check", a: "Yes. That's why every line is labeled verified or inferred. We caught stale profiles, a conflicting job title and a wrong employee count while building this. Check the Research log on each contact." },
];

function context(path) {
  if (path === "/" || path === "") return "hub";
  if (/\/mock$/.test(path)) return "mock";
  if (/^\/accounts\/[^/]+\/contacts\/[^/]+$/.test(path)) return "contact";
  if (/^\/accounts\/[^/]+$/.test(path)) return "account";
  if (path.startsWith("/accounts") || path.startsWith("/new")) return "accounts";
  if (path.startsWith("/training")) return "training";
  if (path.startsWith("/dashboards")) return "dash";
  return "hub";
}
const GREET = { hub: "Here's what people usually need on the Main Hub:", accounts: "Looking for someone? I can help with:", account: "On a company page, people usually want to:", contact: "Getting ready to reach out? I can help you:", mock: "Before you practice:", training: "About your practice results:", dash: "About these numbers:" };

function suggestions(ctx) {
  const local = KB.filter(k => k.ctx.includes(ctx));
  const global = KB.filter(k => k.ctx.includes("*"));
  return [...local.slice(0, 4), ...global.slice(0, 1)];
}

function match(text) {
  const words = text.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2);
  let best = null, bestScore = 0;
  for (const k of KB) {
    const hay = `${k.q} ${k.kw}`.toLowerCase();
    const score = words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
    if (score > bestScore) { best = k; bestScore = score; }
  }
  return bestScore > 0 ? best : null;
}

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === "class") n.className = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v); }
  for (const c of kids) if (c != null) n.append(c);
  return n;
}

export function mountGuide(root, { path, firstName }) {
  root.innerHTML = "";
  const ctx = context(path);
  const toggle = el("button", { type: "button", class: "guide-fab", "aria-expanded": "false", "aria-controls": "guide-panel" }, el("span", { "aria-hidden": "true", class: "guide-fab-ico" }, "?"), "Guide");
  const log = el("div", { class: "guide-log", role: "log", "aria-live": "polite" });
  const input = el("input", { type: "text", id: "guide-q", placeholder: "Ask how to do something…", "aria-label": "Ask the guide", autocomplete: "off" });
  const form = el("form", { class: "guide-form" }, input, el("button", { type: "submit", class: "btn" }, "Ask"));
  const panel = el("section", { class: "guide-panel", id: "guide-panel", role: "dialog", "aria-label": "Call Ready guide", hidden: "" },
    el("div", { class: "guide-head" }, el("strong", {}, "Guide"), el("button", { type: "button", class: "btn ghost", "aria-label": "Close guide", onclick: () => close() }, "Close")),
    log, form);
  root.append(panel, toggle);

  const bot = (text, actions = [], chips = []) => {
    const b = el("div", { class: "guide-msg bot" }, el("p", {}, text));
    if (actions.length) b.append(el("div", { class: "guide-acts" }, ...actions.map(a => a.href
      ? el("a", { class: "btn", href: a.href }, a.label)
      : el("button", { type: "button", class: "btn", onclick: () => { const t = document.querySelector(`[data-guide='${a.click}']`); close(); if (t) { t.focus?.(); t.click(); t.scrollIntoView?.({ block: "center" }); } } }, a.label))));
    if (chips.length) b.append(el("div", { class: "guide-chips" }, ...chips.map(k => el("button", { type: "button", class: "chip plain guide-chip", onclick: () => ask(k) }, k.q))));
    log.append(b); log.scrollTop = log.scrollHeight;
  };
  const me = text => { log.append(el("div", { class: "guide-msg me" }, el("p", {}, text))); };
  const ask = k => { me(k.q); bot(typeof k.a === "function" ? k.a() : k.a, k.act || [], []); };
  const intro = () => bot(`${firstName ? `Hi ${firstName}. ` : ""}${GREET[ctx]}`, [], suggestions(ctx));

  function open() { panel.hidden = false; toggle.setAttribute("aria-expanded", "true"); if (!log.childElementCount) intro(); setTimeout(() => input.focus(), 30); }
  function close() { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
  toggle.addEventListener("click", () => (panel.hidden ? open() : close()));
  panel.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const q = input.value.trim(); if (!q) return;
    input.value = ""; me(q);
    const k = match(q);
    if (k) bot(typeof k.a === "function" ? k.a() : k.a, k.act || []);
    else bot("I'm not sure about that one. Here's what I can help with on this page:", [], suggestions(ctx));
  });
  return { open, close };
}
