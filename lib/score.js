// Call Readiness Score: graded on things you can observe in the transcript, against a visible rubric.
// Retell transcript roles: "user" = the rep (you), "agent" = the AI prospect.

export const RUBRIC = [
  { id: "connect", part: "C", label: "Connect", points: 20, test: "Thanked them and referenced a real signal about their company in your first two turns." },
  { id: "reason", part: "R", label: "Reason", points: 15, test: "Stated a clear reason for the call (\"I'm calling because…\")." },
  { id: "iknow", part: "Q", label: "“I know ___” question", points: 15, test: "Led a question with what you know (\"I know…\", \"I saw…\", \"I noticed…\")." },
  { id: "ladder", part: "Q", label: "Follow-on depth", points: 15, test: "Asked follow-ups at least three levels deep (three or more question turns in a row)." },
  { id: "value", part: "V", label: "Value (GET / PAIN / RISK)", points: 20, test: "Named a concrete gain, cost saving or risk reduction in freight terms." },
  { id: "ask", part: "A", label: "Clear yes/no ask", points: 15, test: "Ended with a specific yes/no ask that has a time attached." },
];

const VALUE_WORDS = ["save", "saving", "cost", "per load", "capacity", "on-time", "on time", "reduce", "cut", "risk", "backup", "back up", "surge", "peak", "dwell", "fill rate", "reliab", "visibility", "tracking", "faster"];
const TIME_WORDS = ["monday", "tuesday", "wednesday", "thursday", "friday", "next week", "minutes", "tomorrow", "this week", "15", "20", "30"];

export function parseTranscript(transcriptObject, transcriptText) {
  if (Array.isArray(transcriptObject) && transcriptObject.length) {
    return transcriptObject.map(t => ({ role: t.role === "agent" ? "prospect" : "rep", text: t.content || "" }));
  }
  return (transcriptText || "").split(/\n+/).map(l => {
    const m = l.match(/^(Agent|User)\s*:\s*(.*)$/i);
    return m ? { role: m[1].toLowerCase() === "agent" ? "prospect" : "rep", text: m[2] } : null;
  }).filter(Boolean);
}

export function scoreCall(turns, account) {
  const rep = turns.filter(t => t.role === "rep");
  const lower = s => s.toLowerCase();
  const results = {};
  const keywords = signalKeywords(account);

  const early = rep.slice(0, 2).map(t => lower(t.text)).join(" ");
  const thanked = /thank|appreciate|thanks/.test(early);
  const signal = keywords.some(k => early.includes(k));
  results.connect = thanked && signal ? 1 : thanked || signal ? 0.5 : 0;

  results.reason = rep.some(t => /(calling|reaching out|the reason|why i'm calling|i wanted to)/.test(lower(t.text))) ? 1 : 0;

  results.iknow = rep.some(t => /\b(i know|i saw|i noticed|i read|i see that)\b/.test(lower(t.text)) && t.text.includes("?")) ? 1
    : rep.some(t => /\b(i know|i saw|i noticed)\b/.test(lower(t.text))) ? 0.5 : 0;

  let run = 0, best = 0;
  for (const t of turns) {
    if (t.role !== "rep") continue;
    if (t.text.includes("?")) { run++; best = Math.max(best, run); } else run = 0;
  }
  results.ladder = best >= 3 ? 1 : best === 2 ? 0.5 : 0;

  const valueHits = rep.filter(t => VALUE_WORDS.some(w => lower(t.text).includes(w))).length;
  results.value = valueHits >= 2 ? 1 : valueHits === 1 ? 0.5 : 0;

  const tail = rep.slice(-3);
  const askTurn = tail.find(t => /\b(would you|are you open|could we|can we|does .* work|would .* work|open to|willing to)\b/.test(lower(t.text)) && t.text.includes("?"));
  results.ask = askTurn ? (TIME_WORDS.some(w => lower(askTurn.text).includes(w)) ? 1 : 0.5) : 0;

  const items = RUBRIC.map(r => ({ ...r, earned: Math.round(r.points * results[r.id]), status: results[r.id] === 1 ? "hit" : results[r.id] > 0 ? "partial" : "missed" }));
  const total = items.reduce((s, i) => s + i.earned, 0);
  const repWords = rep.reduce((s, t) => s + t.text.split(/\s+/).length, 0);
  const allWords = turns.reduce((s, t) => s + t.text.split(/\s+/).length, 0) || 1;
  const talkRatio = Math.round((repWords / allWords) * 100);
  const band = total >= 80 ? "Ready for the real call" : total >= 60 ? "Almost ready" : "Practice again";
  return { total, band, items, talkRatio, turns: turns.length, feedback: feedback(items, talkRatio, account) };
}

function signalKeywords(account) {
  const map = {
    bluelinx: ["trex", "rdi", "smartside", "lp ", "disdero", "portland", "dc", "distribution center", "spring"],
    pirelli: ["rome", "expansion", "silao", "cyber", "mcdonough", "georgia", "plant", "tariff"],
    aosmith: ["groveport", "appleton", "haltom", "leonard", "price increase", "juárez", "juarez", "johnson city", "plant"],
  };
  return map[account?.id] || (account?.name || "").toLowerCase().split(/\s+/);
}

function feedback(items, talkRatio, account) {
  const t = account?.brief?.talkTrack || {};
  const q = account?.brief?.questions?.[0];
  const tips = [];
  for (const i of items) {
    if (i.status === "hit") continue;
    if (i.id === "connect") tips.push(`Open with thanks plus the signal. Try: “${t.C}”`);
    if (i.id === "reason") tips.push(`Say why you're calling in one sentence: “${t.R}”`);
    if (i.id === "iknow") tips.push(q ? `Lead with what you know: “${q.know} ${q.dontKnow}”` : "Lead with “I know ___. What I don't know is ___.”");
    if (i.id === "ladder") tips.push(q ? `Stay on one topic and go three levels deep: ${q.ladder.map(x => `“${x}”`).join(" → ")}` : "Ask three follow-ups in a row on the same topic.");
    if (i.id === "value") tips.push(`Name the value in freight terms. Pick one: GET “${t.V?.GET}” / PAIN “${t.V?.PAIN}” / RISK “${t.V?.RISK}”`);
    if (i.id === "ask") tips.push(`Close with a yes/no ask and times: “${t.A}”`);
  }
  if (talkRatio > 60) tips.push(`You spoke ${talkRatio}% of the words. Aim for under 50%: ask, then let them talk.`);
  if (!tips.length) tips.push("You hit every move. On the real call, keep the same order and listen for the next question inside each answer.");
  return tips;
}
