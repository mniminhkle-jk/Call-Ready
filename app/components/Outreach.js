"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import CopyButton from "./CopyButton";

export default function Outreach({ account, contact, options, drafts, li }) {
  const [mode, setMode] = useState(null); // "email" | "linkedin"
  const usable = options.filter(o => o.usable);
  const [connectId, setConnectId] = useState(usable[0]?.id || "company");
  const [driver, setDriver] = useState("PAIN");
  const [ask, setAsk] = useState("meeting");
  const d = drafts[`${connectId}|${driver}|${ask}`];
  const l = li[connectId];
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [liText, setLiText] = useState("");
  const [msg, setMsg] = useState("");
  const modalRef = useRef(null);
  const opener = useRef(null);
  useEffect(() => {
    if (!mode) return;
    const first = modalRef.current?.querySelector("select, textarea, button");
    first?.focus();
    const onKey = e => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);
  // Main Hub "Draft email" links here with ?compose=email so the draft opens right away.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("compose");
    if (q === "email") openEmail(); else if (q === "linkedin") openLi();
    if (q) window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function closeModal() { setMode(null); setTimeout(() => opener.current?.focus(), 0); }

  function openEmail() { setBody(d.body); setSubject(d.subject); setMode("email"); setMsg(""); api("/api/activity", "POST", { account_id: account.id, contact_id: contact.id, kind: "email-drafted", detail: contact.name || contact.title }).catch(() => {}); }
  function openLi() { setLiText(l.text); setMode("linkedin"); setMsg(""); api("/api/activity", "POST", { account_id: account.id, contact_id: contact.id, kind: "linkedin-drafted", detail: contact.name || contact.title }).catch(() => {}); }
  function regen(next) {
    const key = `${next.connectId ?? connectId}|${next.driver ?? driver}|${next.ask ?? ask}`;
    if (next.connectId) setConnectId(next.connectId);
    if (next.driver) setDriver(next.driver);
    if (next.ask) setAsk(next.ask);
    if (mode === "email") { setBody(drafts[key].body); setSubject(drafts[key].subject); }
    if (mode === "linkedin" && next.connectId) setLiText(li[next.connectId].text);
  }
  async function markSent(kind) {
    await api("/api/activity", "POST", { account_id: account.id, contact_id: contact.id, kind, detail: contact.name || contact.title });
    setMsg("Logged as sent."); setTimeout(closeModal, 900);
  }
  const mailto = `mailto:${contact.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const lines = mode === "email" ? d.lines : l?.lines || [];

  return (
    <>
        <button className="btn" onClick={e => { opener.current = e.currentTarget; openEmail(); }} data-guide="draft-email">Draft email</button>
        <button className="btn secondary" onClick={e => { opener.current = e.currentTarget; openLi(); }} data-guide="draft-linkedin">LinkedIn note</button>

      {mode && <div className="modal-bg" onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="draft-title" ref={modalRef}>
          <div className="card-head" style={{ marginBottom: 0 }}><h2 id="draft-title">{mode === "email" ? "Email draft" : "LinkedIn note"}</h2><button className="btn ghost" onClick={closeModal}>Close</button></div>
          <p className="small muted" style={{ margin: 0 }}>{mode === "email" ? "Built in CRVA order from the brief. Edit it, then send from your own email." : "Under 200 characters. Edit it, then send it on LinkedIn."}</p>
          <div className="field-grid">
            <div><label htmlFor="o-connect">Connect with</label><select id="o-connect" value={connectId} onChange={e => regen({ connectId: e.target.value })}>{options.map(o => <option key={o.id} value={o.id} disabled={!o.usable}>{o.label}{o.usable ? "" : " (locked)"}</option>)}</select></div>
            {mode === "email" && <>
              <div><label htmlFor="o-driver">Value driver</label><select id="o-driver" value={driver} onChange={e => regen({ driver: e.target.value })}><option value="GET">GET: increase something good</option><option value="PAIN">PAIN: reduce cost or effort</option><option value="RISK">RISK: improve the odds</option></select></div>
              <div><label htmlFor="o-ask">Ask</label><select id="o-ask" value={ask} onChange={e => regen({ ask: e.target.value })}><option value="meeting">15-minute meeting</option><option value="referral">Referral to the right person</option></select></div>
            </>}
          </div>
          <div>
            <details className="more"><summary>Where each line comes from</summary>
            {lines.map((x, i) => <div key={i} className="draft-line"><span className="p">{x.part}</span><div className="small"><div>{x.text}</div><div className="muted">{x.sourceLabel}{x.source && <> · <a className="src" href={x.source} target="_blank" rel="noreferrer">source</a></>}</div></div></div>)}
          </details></div>
          {mode === "email" ? <>
            <div><label htmlFor="o-subj">Subject</label><input id="o-subj" type="text" value={subject} onChange={e => setSubject(e.target.value)} /></div>
            <div><label htmlFor="o-body">Email (edit before sending)</label><textarea id="o-body" rows={11} value={body} onChange={e => setBody(e.target.value)} /></div>
            {!contact.email && <div className="notice small">No email on file yet. Copy the text, or add their email under Contact info.</div>}
            <div className="row">
              <CopyButton text={`Subject: ${subject}\n\n${body}`} label="Copy email" className="btn" />
              <a className="btn secondary" href={mailto}>Open in mail app</a>
              <button className="btn secondary" onClick={() => markSent("email-sent")}>I sent it</button>
            </div>
          </> : <>
            <div><label htmlFor="o-li">Note (edit before sending)</label><textarea id="o-li" rows={4} value={liText} onChange={e => setLiText(e.target.value)} /></div>
            <div className="small" style={{ color: liText.length > 200 ? "var(--err)" : "var(--muted)" }}>{liText.length} / 200 characters</div>
            <div className="row">
              <CopyButton text={liText} label="Copy note" className="btn" />
              <a className="btn secondary" target="_blank" rel="noreferrer" href={contact.linkedin_url || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(contact.name || contact.title + " " + account.name)}`}>Open LinkedIn</a>
              <button className="btn secondary" disabled={liText.length > 200} onClick={() => markSent("linkedin-sent")}>I sent it</button>
            </div>
          </>}
          {msg && <div className="notice ok small">{msg}</div>}
        </div>
      </div>}
    </>
  );
}
