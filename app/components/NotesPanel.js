"use client";
import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { api, fmtDateTime } from "./api";

const CQPPPIN = [
  ["clarify", "Clarify", "What did they really mean? Who owns what?"],
  ["quantify", "Quantify", "How many loads, lanes, how much, by when?"],
  ["process", "Process", "How do they move freight now? Fleet, carriers, brokers, TMS?"],
  ["progress", "Progress", "How are they doing against their goals?"],
  ["problem", "Problem", "What's working or broken?"],
  ["implication", "Implication", "What happens if the problem continues?"],
  ["needsPayoff", "Needs-payoff", "What would be better if solved?"],
];
const STAGES = ["Research", "Outreach", "Connected", "Discovery", "Lane test / Quote", "Active shipper", "Closed lost"];

const empty = () => ({ purpose: "", method: "Phone", contact_id: "", results: Object.fromEntries(CQPPPIN.map(([k]) => [k, ""])), contacts: "", decisionMaker: "", next: [{ text: "", due: "", owner: "" }], unclear: "", stage: "" });

export default function NotesPanel({ accountId, contacts, notes, stage, contactId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(() => ({ ...empty(), contact_id: contactId || "" }));
  const [granola, setGranola] = useState(null);
  const [gId, setGId] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const setR = k => e => setF(s => ({ ...s, results: { ...s.results, [k]: e.target.value } }));
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }));

  const strength = [
    CQPPPIN.filter(([k]) => f.results[k].trim()).length >= 3,
    !!f.method && (!!f.contacts.trim() || !!f.contact_id),
    f.next.some(n => n.text.trim() && n.due),
    !!f.purpose.trim(),
  ];

  async function loadGranola() {
    setMsg(""); setBusy(true);
    try { const r = await api("/api/granola"); setGranola(r.notes); if (!r.notes.length) setMsg("No processed Granola notes in the last 30 days. Granola only returns notes that have a summary and transcript."); }
    catch (e) { setMsg(`Granola: ${e.message}`); }
    setBusy(false);
  }
  async function useGranola(id) {
    setBusy(true); setMsg("");
    try {
      const r = await api(`/api/granola/${encodeURIComponent(id)}`);
      setF(s => ({ ...s, ...r.prn, results: { ...s.results, ...r.prn.results }, next: r.prn.next.length ? r.prn.next : s.next, contact_id: s.contact_id }));
      setGId(id); setGranola(null); setOpen(true);
      setMsg("Draft filled from Granola. Check every bucket before saving: the sorting is rule-based.");
    } catch (e) { setMsg(`Granola: ${e.message}`); }
    setBusy(false);
  }
  async function save(e) {
    e.preventDefault(); setMsg("");
    const filled = CQPPPIN.filter(([k]) => f.results[k].trim()).length;
    if (!f.purpose.trim()) return setMsg("Add the purpose (P): one sentence on why you met.");
    if (filled < 3) return setMsg(`Add at least 3 of the 7 Results (R). You have ${filled}. Quantify, Process and Problem are a good start.`);
    if (!f.next.some(n => n.text.trim() && n.due)) return setMsg("Add at least one next step (N) with a due date.");
    setBusy(true);
    try {
      await api("/api/notes", "POST", { account_id: accountId, contact_id: f.contact_id || null, kind: gId ? "granola" : "call", method: f.method, granola_id: gId, stage: f.stage || null, prn: { purpose: f.purpose, results: f.results, contacts: f.contacts, decisionMaker: f.decisionMaker, next: f.next.filter(n => n.text.trim()), unclear: f.unclear } });
      setF({ ...empty(), contact_id: contactId || "" }); setGId(null); setOpen(false); setMsg("Note saved. The brief and next steps now include it.");
      router.refresh();
    } catch (e2) { setMsg(e2.message); }
    setBusy(false);
  }

  return (
    <section className="card stack">
      <div className="card-head" style={{ marginBottom: 0 }}>
        <h2>Call notes</h2>
        <div className="row">
          <button className="btn secondary" type="button" disabled={busy} onClick={loadGranola}>Import from Granola</button>
          <button className="btn" type="button" onClick={() => setOpen(o => !o)} data-guide="log-call">{open ? "Close form" : "Log a call"}</button>
        </div>
      </div>
      {msg && <div className="notice small">{msg}</div>}
      {granola && granola.length > 0 && <div className="stack small">
        <div className="muted">Pick a meeting to turn into a PRN note:</div>
        {granola.map(n => <button key={n.id} className="result" style={{ textAlign: "left", cursor: "pointer", font: "inherit" }} onClick={() => useGranola(n.id)}><span><b>{n.title}</b><br /><span className="muted">{fmtDateTime(n.created_at)} {n.owner && `· ${n.owner}`}</span></span><span className="pill">Use</span></button>)}
      </div>}

      {open && <form className="stack" onSubmit={save}>
        <div><label htmlFor="n-purpose">P · Purpose (one sentence; matches your CRVA Reason)</label><input id="n-purpose" type="text" value={f.purpose} onChange={set("purpose")} placeholder="Intro call + start discovery on inbound Trex lanes" /></div>
        <div className="field-grid">
          <div><label htmlFor="n-method">Meeting method</label><select id="n-method" value={f.method} onChange={set("method")}>{["Phone", "Zoom / Teams", "Face to face", "Email", "Video / in person (Granola)"].map(m => <option key={m}>{m}</option>)}</select></div>
          <div><label htmlFor="n-contact">Main contact</label><select id="n-contact" value={f.contact_id} onChange={set("contact_id")}><option value="">Not linked</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
          <div><label htmlFor="n-stage">Move stage to</label><select id="n-stage" value={f.stage} onChange={set("stage")}><option value="">Keep “{stage}”</option>{STAGES.map(s => <option key={s}>{s}</option>)}</select></div>
        </div>
        <div className="eyebrow">R · Results (CQPPPIN): at least 3 of 7</div>
        {CQPPPIN.map(([k, l, hint]) => <div key={k}><label htmlFor={`n-${k}`}>{l} <span className="muted" style={{ fontWeight: 400 }}>· {hint}</span></label><textarea id={`n-${k}`} rows={2} value={f.results[k]} onChange={setR(k)} /></div>)}
        <div className="field-grid">
          <div><label htmlFor="n-contacts">New contacts / titles uncovered</label><input id="n-contacts" type="text" value={f.contacts} onChange={set("contacts")} /></div>
          <div><label htmlFor="n-dm">Decision maker</label><input id="n-dm" type="text" value={f.decisionMaker} onChange={set("decisionMaker")} /></div>
        </div>
        <div className="eyebrow">N · Next steps (time-bound, with an owner)</div>
        {f.next.map((n, i) => <div key={i} className="field-grid" style={{ gridTemplateColumns: "minmax(0,3fr) minmax(0,1.2fr) minmax(0,1.2fr)" }}>
          <div><label htmlFor={`ns-${i}`}>Step</label><input id={`ns-${i}`} type="text" value={n.text} onChange={e => setF(s => ({ ...s, next: s.next.map((x, j) => j === i ? { ...x, text: e.target.value } : x) }))} /></div>
          <div><label htmlFor={`nd-${i}`}>Due</label><input id={`nd-${i}`} type="date" value={n.due} onChange={e => setF(s => ({ ...s, next: s.next.map((x, j) => j === i ? { ...x, due: e.target.value } : x) }))} /></div>
          <div><label htmlFor={`no-${i}`}>Owner</label><input id={`no-${i}`} type="text" value={n.owner} onChange={e => setF(s => ({ ...s, next: s.next.map((x, j) => j === i ? { ...x, owner: e.target.value } : x) }))} /></div>
        </div>)}
        <div><button type="button" className="btn ghost" onClick={() => setF(s => ({ ...s, next: [...s.next, { text: "", due: "", owner: "" }] }))}>+ Add step</button></div>
        <div><label htmlFor="n-unclear">Still unclear</label><input id="n-unclear" type="text" value={f.unclear} onChange={set("unclear")} /></div>
        <div className="notice small">
          <b>Strong-notes check:</b>{" "}
          {["3+ CQPPPIN takeaways", "method + names", "dated next step", "clear purpose"].map((t, i) => <span key={t} style={{ marginRight: 10, color: strength[i] ? "var(--ok)" : "var(--muted)" }}>{strength[i] ? "✓" : "○"} {t}</span>)}
        </div>
        <div className="row"><button className="btn" type="submit" disabled={busy}>Save call notes</button></div>
      </form>}

      {notes.length === 0 && <p className="muted small" style={{ margin: 0 }}>No calls logged yet. Your first note feeds the next steps and the one-page brief.</p>}
      <div className="stack" style={{ gap: 12 }}>
        {notes.map(n => { const filled = CQPPPIN.filter(([k]) => n.prn.results?.[k]).length; return (
          <article key={n.id} className="note">
            <header className="row spread small"><span><b>{n.author}</b> · {fmtDateTime(n.created_at)} · {n.method}{n.kind === "granola" ? " · from Granola" : ""}</span><span className={`chip ${filled >= 3 ? "green" : "yellow"}`}>{filled}/7 CQPPPIN</span></header>
            <div className="prn-row"><span className="prn-k" aria-label="Purpose">P</span><div>{n.prn.purpose}</div></div>
            <div className="prn-row"><span className="prn-k" aria-label="Results">R</span><dl className="kv small">{CQPPPIN.map(([k, l]) => <Fragment key={k}><dt>{l}</dt><dd>{n.prn.results?.[k] || <span className="empty-val">Not captured</span>}</dd></Fragment>)}{n.prn.contacts && <><dt>New contacts</dt><dd>{n.prn.contacts}</dd></>}{n.prn.decisionMaker && <><dt>Decision maker</dt><dd>{n.prn.decisionMaker}</dd></>}</dl></div>
            <div className="prn-row"><span className="prn-k" aria-label="Next steps">N</span><div className="small"><ul className="list">{(n.prn.next || []).map((x, i) => <li key={i}>{x.text}{x.due ? ` (due ${x.due}${x.owner ? `, ${x.owner}` : ""})` : ""}</li>)}</ul>{n.prn.unclear && <div className="muted" style={{ marginTop: 4 }}><b>Still unclear:</b> {n.prn.unclear}</div>}</div></div>
          </article>); })}
      </div>
    </section>
  );
}
