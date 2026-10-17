// CRVA outreach drafts assembled from sourced brief lines. No AI: every line traces to a source or to the rep.

export function connectOptions(account, contact) {
  const opts = [];
  const brief = account.brief || {};
  const srcUrl = n => brief.sources?.find(s => s.n === n)?.url;
  if (brief.crva?.companyHook) opts.push({ id: "company", label: "Company signal", text: brief.crva.companyHook.text, source: srcUrl(brief.crva.companyHook.src), usable: true });
  (contact?.hooks || []).forEach((h, i) => {
    const usable = h.type !== "personal" || h.confirmed;
    opts.push({ id: `hook${i}`, label: h.type === "personal" ? "Personal background (needs rep confirmation)" : "Their public professional post", text: h.text, say: h.say, source: h.src, usable });
  });
  return opts;
}

function firstName(contact) {
  return contact?.name ? contact.name.split(" ")[0] : "there";
}

// Rewrites a stored hook into a Connect sentence addressed to the person.
function connectSentence(opt, contact) {
  if (!opt) return "";
  if (opt.id === "company") return opt.text;
  if (opt.say) return opt.say;
  const t = opt.text.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return `I came across this and it stuck with me: ${t}${/[.!?]$/.test(t) ? "" : "."}`;
}

export function buildEmail(account, contact, { connectId = "company", driver = "PAIN", ask = "meeting", senderName = "Minh Le" } = {}) {
  const brief = account.brief || {};
  const opts = connectOptions(account, contact);
  const c = opts.find(o => o.id === connectId && o.usable) || opts.find(o => o.usable);
  const crva = brief.crva || {};
  const lines = [
    { part: "C", text: connectSentence(c, contact), source: c?.source, sourceLabel: c?.label },
    { part: "R", text: crva.reason || "I'm reaching out because we help shippers like you cover new and peak-season lanes.", sourceLabel: "Brokerage value proposition (rep)" },
    { part: "V", text: crva.value?.[driver] || "", sourceLabel: `${driver} value driver, tied to brief signals` },
    { part: "A", text: crva.asks?.[ask] || crva.asks?.meeting, sourceLabel: "Ask: yes/no, ends with a question mark" },
  ];
  const subjectBits = { bluelinx: "New inbound lanes for Trex and RDI", pirelli: "Silao and McDonough lanes during the Rome ramp", aosmith: "Groveport transfer and new Appleton lanes" };
  const subject = subjectBits[account.id] || `${account.name}: freight coverage question`;
  const body = `Hi ${firstName(contact)},\n\n${lines[0].text}\n\n${lines[1].text} ${lines[2].text}\n\n${lines[3].text}\n\nBest,\n${senderName}`;
  return { subject, body, lines };
}

export function buildLinkedIn(account, contact, { connectId = "company" } = {}) {
  const brief = account.brief || {};
  const opts = connectOptions(account, contact);
  const c = opts.find(o => o.id === connectId && o.usable) || opts.find(o => o.usable);
  const hook = shortHook(account, c);
  const value = brief.crva?.liValue || "We help shippers cover new lanes.";
  const ask = "Open to connecting?";
  const hi = contact?.name ? `Hi ${firstName(contact)}, ` : "Hi, ";
  const h = lowerFirst(hook);
  let text = `${hi}${h} ${value} ${ask}`;
  if (text.length > 199) text = `${hi}${h} ${ask}`;
  if (text.length > 199) text = text.slice(0, 196) + "…";
  return {
    text,
    length: text.length,
    lines: [
      { part: "C", text: hook, source: c?.source, sourceLabel: c?.label },
      { part: "V", text: value, sourceLabel: "Value line from the brief" },
      { part: "A", text: ask, sourceLabel: "Ask" },
    ],
  };
}

function shortHook(account, c) {
  const map = {
    bluelinx: "Congrats on bringing Trex into your 11 DCs in September.",
    pirelli: "Congrats on the Rome, GA expansion approval.",
    aosmith: "Saw Groveport is moving to Appleton and Haltom City.",
  };
  if (c && c.id !== "company" && c.say && c.say.length <= 120) return c.say;
  return map[account.id] || (account.brief?.crva?.companyHook?.text || "").split(/[.;]/)[0] + ".";
}

const lowerFirst = t => (/^I\b/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));

// Cold-call checklist: what the rep must hit, by CRVA move.
export function callChecklist(account, contact) {
  const b = account.brief || {};
  const t = b.talkTrack || {};
  const q = b.questions?.[0];
  return [
    { part: "C", title: "Connect", hit: "Thank them for the time, then ask about the signal.", say: t.C },
    { part: "R", title: "Reason", hit: "One clear sentence on why you're calling. Mirror their energy.", say: t.R },
    { part: "Q", title: "Discovery", hit: "Lead with “I know ___. What I don't know is ___.” Follow on three levels deep without changing topic.", say: q ? `${q.know} ${q.dontKnow}` : "" },
    { part: "V", title: "Value", hit: "Pick GET, PAIN or RISK based on what they just told you. Use a real number if you have one.", say: t.V?.PAIN },
    { part: "A", title: "Ask", hit: "A specific yes/no ask with times. You can ask for more than one thing.", say: t.A },
  ];
}
