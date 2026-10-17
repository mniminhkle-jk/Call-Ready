// Server-side clients for Exa (research + signal watch), Retell (mock calls) and Granola (meeting notes).
import { db } from "./db";
import { SIGNAL_KEYWORDS } from "./seed";

// ───────── Exa ─────────
export async function exaSearch(query, { days = 90, num = 5 } = {}) {
  const key = process.env.EXA_API_KEY;
  if (!key) throw new Error("EXA_API_KEY is not set.");
  const start = new Date(Date.now() - days * 864e5).toISOString();
  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key },
    body: JSON.stringify({ query, numResults: num, startPublishedDate: start, type: "auto", contents: { highlights: { numSentences: 2, highlightsPerUrl: 1 } } }),
  });
  if (!res.ok) throw new Error(`Exa search failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return (data.results || []).map(r => ({ title: r.title || r.url, url: r.url, published_at: r.publishedDate || null, summary: (r.highlights || []).join(" ").slice(0, 400) }));
}

export function categorize(text) {
  const t = text.toLowerCase();
  if (/(acquire|acquisition|merger)/.test(t)) return "Acquisition";
  if (/(tariff|usmca|duty|section 232)/.test(t)) return "Tariff / trade";
  if (/(hiring|job|career|posting)/.test(t)) return "Logistics hiring";
  if (/(closing|closure|shutter|relocat|consolidat)/.test(t)) return "Facility move";
  if (/(distribution center|warehouse|plant|facility|expan|groundbreak|lease)/.test(t)) return "Facility";
  if (/(earnings|results|quarter|revenue|sales)/.test(t)) return "Financial";
  if (/(launch|new product|partnership|distribution relationship)/.test(t)) return "New product line";
  return "News";
}

// Event-trigger watch: searches the freight keywords for one account and stores new, de-duplicated signals.
export async function refreshSignals(account) {
  const queries = [
    `${account.name} new distribution center OR plant expansion OR new facility`,
    `${account.name} logistics OR transportation OR supply chain news`,
    `${account.name} acquisition OR plant closure OR tariff impact`,
    `${account.name} hiring transportation manager OR logistics manager`,
  ];
  const found = [];
  for (const q of queries) {
    try { found.push(...(await exaSearch(q, { days: 90, num: 5 }))); } catch (e) { found.push({ error: e.message }); }
  }
  const errors = found.filter(f => f.error).map(f => f.error);
  const nameBits = account.name.toLowerCase().split(/[\s.]+/).filter(w => w.length > 2 && !["tire", "north", "america", "inc"].includes(w));
  const rows = [];
  const seen = new Set();
  for (const f of found) {
    if (f.error || !f.url || seen.has(f.url)) continue;
    seen.add(f.url);
    const text = `${f.title} ${f.summary}`.toLowerCase();
    if (!nameBits.some(w => text.includes(w))) continue; // drop results that don't mention the company
    rows.push({ account_id: account.id, title: f.title.slice(0, 240), url: f.url, published_at: f.published_at, summary: f.summary, category: categorize(text), status: "new", source: "exa" });
  }
  let inserted = 0;
  if (rows.length) {
    const { data, error } = await db().from("signals").upsert(rows, { onConflict: "account_id,url", ignoreDuplicates: true }).select("id");
    if (error) throw error;
    inserted = data?.length || 0;
  }
  await db().from("accounts").update({ signals_checked_at: new Date().toISOString() }).eq("id", account.id);
  return { checked: found.length, matched: rows.length, inserted, errors, keywords: SIGNAL_KEYWORDS };
}

// ───────── Retell ─────────
const RETELL = "https://api.retellai.com";
export const BUDGET_CENTS = Number(process.env.RETELL_BUDGET_CENTS || 900); // stay under the $10 free credit
export const MAX_CALL_MS = 300000; // 5 minutes per mock call
export const RESERVE_CENTS = 45;    // worst case for one 5-minute call (~9¢/min)
export const RETELL_MODEL = process.env.RETELL_MODEL || "gpt-4.1-mini";

async function retell(path, init = {}) {
  const key = process.env.RETELL_API_KEY;
  if (!key) throw new Error("RETELL_API_KEY is not set.");
  const res = await fetch(RETELL + path, { ...init, headers: { authorization: `Bearer ${key}`, "content-type": "application/json", ...(init.headers || {}) }, cache: "no-store" });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) throw new Error(`Retell ${path} failed (${res.status}): ${typeof body === "string" ? body.slice(0, 200) : JSON.stringify(body).slice(0, 200)}`);
  return body;
}

const PERSONA_PROMPT = `You are role-playing a real prospect on a cold call from a freight broker sales rep. Stay in character the whole call.

Who you are: {{persona_name}}, {{persona_title}} at {{company}}.
What your company is dealing with right now (only share details if the rep earns it with a good question): {{company_context}}
What you care about: {{cares}}
What a broker could give you: {{value_to_them}}
Typical pushback you use: {{objections}}
The rep's goal for this call: {{call_goal}}
How receptive you are: {{difficulty}}

Rules:
- Answer the phone like a busy logistics professional. Keep answers short (1–3 sentences), like a real phone call.
- Don't volunteer information. Give a vague answer to a generic question; give a specific, useful answer when the rep shows they did homework ("I know ___") and follows up on what you just said.
- Use at least one of your objections naturally. If the rep handles it well, soften.
- Only agree to a meeting if the rep makes a clear, specific yes/no ask and has given you a real reason. Otherwise say "send me an email".
- Never say you are an AI and never coach the rep. If the rep is rude or wanders for a long time, politely end the call.
- Wrap up naturally after about 4 minutes.`;

export async function ensureRetellAgent() {
  const sb = db();
  const { data } = await sb.from("settings").select("value").eq("key", "retell_agent").maybeSingle();
  if (data?.value?.agent_id && data.value.model === RETELL_MODEL) return data.value;
  const llm = await retell("/create-retell-llm", {
    method: "POST",
    body: JSON.stringify({
      model: RETELL_MODEL,
      general_prompt: PERSONA_PROMPT,
      begin_message: "{{persona_first}} speaking.",
      start_speaker: "agent",
      model_temperature: 0.6,
      default_dynamic_variables: { persona_name: "Sam Carter", persona_first: "Sam", persona_title: "Transportation Manager", company: "a shipper", company_context: "", cares: "on-time delivery and cost", value_to_them: "backup capacity", objections: "We have carriers.", call_goal: "Book a discovery meeting", difficulty: "Busy but polite" },
    }),
  });
  const agent = await retell("/create-agent", {
    method: "POST",
    body: JSON.stringify({
      response_engine: { type: "retell-llm", llm_id: llm.llm_id },
      voice_id: process.env.RETELL_VOICE_ID || "retell-Cimo",
      agent_name: "Call Ready mock prospect",
      language: "en-US",
      max_call_duration_ms: MAX_CALL_MS,
      end_call_after_silence_ms: 20000,
    }),
  });
  const value = { agent_id: agent.agent_id, llm_id: llm.llm_id, model: RETELL_MODEL, created_at: new Date().toISOString() };
  await sb.from("settings").upsert({ key: "retell_agent", value, updated_at: new Date().toISOString() });
  return value;
}

export async function getRetellCall(callId) {
  return retell(`/v2/get-call/${callId}`);
}

// Refreshes cost for calls that haven't settled, then returns spend so far (cents).
export async function budgetStatus() {
  const sb = db();
  const { data: calls } = await sb.from("mock_calls").select("id,call_id,status,cost_cents,created_at");
  let spent = 0, pending = 0;
  for (const c of calls || []) {
    if (c.status !== "ended" && c.status !== "error" && c.call_id) {
      try {
        const r = await getRetellCall(c.call_id);
        const cost = Number(r.call_cost?.combined_cost || 0);
        if (["ended", "error", "not_connected"].includes(r.call_status)) {
          await sb.from("mock_calls").update({ status: r.call_status === "ended" ? "ended" : "error", cost_cents: cost, duration_s: Math.round((r.duration_ms || 0) / 1000) }).eq("id", c.id);
          spent += cost;
          continue;
        }
        const ageMin = (Date.now() - new Date(c.created_at).getTime()) / 6e4;
        if (ageMin < 15) pending += RESERVE_CENTS;
        else spent += cost;
      } catch {
        pending += RESERVE_CENTS;
      }
    } else spent += Number(c.cost_cents || 0);
  }
  const committed = spent + pending;
  return { spent: Math.round(spent), pending, budget: BUDGET_CENTS, remaining: Math.max(0, BUDGET_CENTS - committed), canStart: committed + RESERVE_CENTS <= BUDGET_CENTS, calls: (calls || []).length };
}

export async function createMockCall(dynamicVars, metadata) {
  const agent = await ensureRetellAgent();
  return retell("/v3/create-web-call", {
    method: "POST",
    body: JSON.stringify({ agent_id: agent.agent_id, retell_llm_dynamic_variables: dynamicVars, metadata }),
  });
}

// ───────── Granola ─────────
const GRANOLA = "https://public-api.granola.ai/v1";
async function granola(path) {
  const key = process.env.GRANOLA_API_KEY;
  if (!key) throw new Error("GRANOLA_API_KEY is not set.");
  const res = await fetch(GRANOLA + path, { headers: { authorization: `Bearer ${key}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`Granola ${path} failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  return res.json();
}
export async function listGranolaNotes(days = 30) {
  const after = new Date(Date.now() - days * 864e5).toISOString();
  const data = await granola(`/notes?created_after=${encodeURIComponent(after)}`);
  return (data.notes || []).map(n => ({ id: n.id, title: n.title || "Untitled meeting", created_at: n.created_at || n.createdAt || null, owner: n.owner?.name || "" }));
}
export async function getGranolaNote(id) {
  return granola(`/notes/${encodeURIComponent(id)}`);
}

// Sorts a meeting summary into PRN / CQPPPIN buckets with simple keyword rules. The rep reviews before saving.
export function summaryToPRN(note) {
  const raw = typeof note.summary === "string" ? note.summary : (note.summary?.markdown || note.summary?.text || JSON.stringify(note.summary || ""));
  const lines = raw.split(/\n+/).map(l => l.replace(/^[\s>*\-•#\d.)]+/, "").trim()).filter(l => l.length > 3);
  const results = { clarify: [], quantify: [], process: [], progress: [], problem: [], implication: [], needsPayoff: [] };
  const next = [];
  for (const l of lines) {
    const t = l.toLowerCase();
    if (/^(next steps?|action items?|summary|notes|attendees)\b:?$/.test(t)) continue;
    if (/(follow up|follow-up|next step|send |schedule|will |by (mon|tue|wed|thu|fri|next)|action item|to do|owner:)/.test(t)) next.push({ text: l, due: "", owner: "" });
    else if (/\d/.test(t) && /(load|truck|lane|week|month|per|%|\$|volume|shipments?|pallets?|miles?)/.test(t)) results.quantify.push(l);
    else if (/(currently|today|we use|they use|process|routing guide|tms|carrier[s]? (are|is)|in-house)/.test(t)) results.process.push(l);
    else if (/(problem|issue|late|delay|missed|short|struggl|pain|frustrat|broke|rejected)/.test(t)) results.problem.push(l);
    else if (/(if this|would mean|impact|cost them|lose|risk|implication|consequence)/.test(t)) results.implication.push(l);
    else if (/(want|need|would like|better|ideal|looking for|wish|goal)/.test(t)) results.needsPayoff.push(l);
    else if (/(growing|grew|down|up |progress|on track|behind|ahead)/.test(t)) results.progress.push(l);
    else results.clarify.push(l);
  }
  const join = a => a.slice(0, 3).join(" ");
  return {
    purpose: note.title || "",
    method: "Video / in person (Granola)",
    results: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, join(v)])),
    contacts: (note.attendees || []).map(a => a.name).filter(Boolean).join(", "),
    decisionMaker: "",
    next: next.slice(0, 5),
    unclear: "",
  };
}
