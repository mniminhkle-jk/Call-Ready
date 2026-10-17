// CRVA outreach drafts assembled from sourced lines in the PERSON brief. No AI: every line traces to a source or to the rep.

const srcUrl = (brief, n) => brief?.sources?.find(s => s.n === n)?.url;

export function connectOptions(contact) {
  const brief = contact?.brief || {};
  const opts = [];
  (contact?.hooks || []).forEach((h, i) => {
    const usable = h.type !== "personal" || h.confirmed;
    opts.push({ id: `hook${i}`, label: h.type === "personal" ? "Personal background (needs rep confirmation)" : "Their public post or profile", text: h.text, say: h.say, source: h.src, usable });
  });
  if (brief.crva?.companyHook) opts.push({ id: "company", label: "Company signal", text: brief.crva.companyHook.text, say: brief.crva.companyHook.text, source: srcUrl(brief, brief.crva.companyHook.src), usable: true });
  return opts;
}

const firstName = c => (c?.name ? c.name.split(" ")[0] : "there");
const lowerFirst = t => (/^I\b/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1));

export function buildEmail(account, contact, { connectId, driver = "PAIN", ask = "meeting", senderName = "Minh Le" } = {}) {
  const crva = contact?.brief?.crva || {};
  const opts = connectOptions(contact);
  const c = opts.find(o => o.id === connectId && o.usable) || opts.find(o => o.usable);
  const lines = [
    { part: "C", text: c?.say || c?.text || "", source: c?.source, sourceLabel: c?.label },
    { part: "R", text: crva.reason || "I'm reaching out because we help shippers cover new and peak-season lanes.", sourceLabel: "Brokerage value proposition (rep)" },
    { part: "V", text: crva.value?.[driver] || "", sourceLabel: `${driver} value driver, tied to brief signals` },
    { part: "A", text: crva.asks?.[ask] || crva.asks?.meeting, sourceLabel: "Ask: yes/no, ends with a question mark" },
  ];
  const subjects = { bluelinx: "New inbound lanes at BlueLinx", pirelli: "Silao and port lanes during the Rome ramp", aosmith: "Groveport transfer and new lanes" };
  const subject = subjects[account.id] || `${account.name}: freight coverage question`;
  const body = `Hi ${firstName(contact)},\n\n${lines[0].text}\n\n${lines[1].text} ${lines[2].text}\n\n${lines[3].text}\n\nBest,\n${senderName}`;
  return { subject, body, lines };
}

export function buildLinkedIn(account, contact, { connectId } = {}) {
  const crva = contact?.brief?.crva || {};
  const opts = connectOptions(contact);
  const c = opts.find(o => o.id === connectId && o.usable) || opts.find(o => o.usable);
  const hook = c && c.id !== "company" && c.say && c.say.length <= 110 ? c.say : (crva.liShort || "Saw your company's recent news.");
  const value = crva.liValue || "We help shippers cover new lanes.";
  const ask = "Open to connecting?";
  const hi = contact?.name ? `Hi ${firstName(contact)}, ` : "Hi, ";
  let text = `${hi}${lowerFirst(hook)} ${value} ${ask}`;
  if (text.length > 199) text = `${hi}${lowerFirst(crva.liShort || hook)} ${value} ${ask}`;
  if (text.length > 199) text = `${hi}${lowerFirst(crva.liShort || hook)} ${ask}`;
  return { text, length: text.length, lines: [{ part: "C", text: hook, source: c?.source, sourceLabel: c?.label }, { part: "V", text: value, sourceLabel: "Value line from the brief" }, { part: "A", text: ask, sourceLabel: "Ask" }] };
}

export function callChecklist(contact) {
  const b = contact?.brief || {};
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
