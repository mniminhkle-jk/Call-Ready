"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, fmtDate } from "./api";

const STAGES = ["Research", "Outreach", "Connected", "Discovery", "Lane test / Quote", "Active shipper", "Closed lost"];

export function StageSelect({ id, stage }) {
  const router = useRouter();
  const [val, setVal] = useState(stage);
  const [busy, setBusy] = useState(false);
  return (
    <div className="row" style={{ gap: 8 }}>
      <label htmlFor="stage" style={{ margin: 0 }}>Stage</label>
      <select id="stage" value={val} disabled={busy} style={{ width: "auto" }} onChange={async e => {
        const v = e.target.value; setVal(v); setBusy(true);
        try { await api(`/api/accounts/${id}`, "PATCH", { stage: v }); router.refresh(); } catch (err) { alert(err.message); setVal(stage); }
        setBusy(false);
      }}>
        {STAGES.map(s => <option key={s}>{s}</option>)}
      </select>
    </div>
  );
}

export function MarkReviewed({ id }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  return (
    <div className="stack" style={{ gap: 6 }}>
      <button className="btn secondary" type="button" onClick={async () => {
        try { await api(`/api/accounts/${id}`, "PATCH", { markReviewed: true }); setMsg("Brief marked reviewed today."); router.refresh(); } catch (e) { setMsg(e.message); }
      }}>Mark brief reviewed</button>
      {msg && <span className="small muted">{msg}</span>}
    </div>
  );
}

export function SignalsPanel({ id, signals, checkedAt }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showAll, setShowAll] = useState(false);
  const visible = signals.filter(s => s.status !== "dismissed");
  const list = showAll ? visible : visible.slice(0, 6);
  async function refresh() {
    setBusy(true); setMsg("");
    try {
      const r = await api(`/api/accounts/${id}/signals`, "POST");
      setMsg(r.errors?.length ? `Exa returned an error: ${r.errors[0]}` : `Checked ${r.checked} results. ${r.inserted} new signal${r.inserted === 1 ? "" : "s"} saved; duplicates skipped.`);
      router.refresh();
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  }
  async function setStatus(sid, status) {
    await api(`/api/signals/${sid}`, "PATCH", { status }).catch(e => alert(e.message));
    router.refresh();
  }
  return (
    <section className="card stack">
      <div className="card-head" style={{ marginBottom: 0 }}><h2>Signals</h2><button className="btn secondary" disabled={busy} onClick={refresh}>{busy ? "Checking…" : "Run Exa check"}</button></div>
      <div className="small muted">Watches the last 90 days for new facilities, expansions, acquisitions, tariffs and logistics hiring. Last checked {checkedAt ? fmtDate(checkedAt) : "never"}.</div>
      {msg && <div className="notice small">{msg}</div>}
      <ul className="timeline small">
        {list.map(s => <li key={s.id}>
          <div className="row" style={{ gap: 6 }}><span className="pill">{s.category || "News"}</span>{s.status === "new" && <span className="chip yellow">new</span>}</div>
          <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
          <div className="muted">{s.published_at ? fmtDate(s.published_at) : "date unknown"}</div>
          {s.status === "new" && <div className="row" style={{ gap: 4 }}>
            <button className="btn ghost small" onClick={() => setStatus(s.id, "reviewed")}>Mark reviewed</button>
            <button className="btn ghost small" onClick={() => setStatus(s.id, "dismissed")}>Dismiss</button>
          </div>}
        </li>)}
      </ul>
      {visible.length > 6 && <button className="btn ghost" onClick={() => setShowAll(v => !v)}>{showAll ? "Show fewer" : `Show all ${visible.length}`}</button>}
    </section>
  );
}

const SECTIONS = [["ships", "What they ship"], ["where", "Where"], ["when", "How often / when"], ["who", "Who moves it today"], ["company", "Company now"]];

export function BriefEditor({ id, brief }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sharp, setSharp] = useState(brief.sharpest?.text || "");
  const [why, setWhy] = useState(brief.sharpest?.why || "");
  const [section, setSection] = useState("where");
  const [text, setText] = useState("");
  const [tag, setTag] = useState("inferred");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(kind) {
    setBusy(true); setMsg("");
    try {
      if (kind === "sharpest") await api(`/api/accounts/${id}`, "PATCH", { sharpest: { text: sharp, why } });
      else {
        if (!text.trim()) throw new Error("Write the line first.");
        if (tag === "verified" && !url.trim()) throw new Error("A verified line needs a source URL. Otherwise mark it inferred.");
        await api(`/api/accounts/${id}`, "PATCH", { addLine: { section, text, tag, url, title } });
        setText(""); setUrl(""); setTitle("");
      }
      setMsg("Saved. The previous version is kept in brief history.");
      router.refresh();
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  }

  if (!open) return <section className="card row spread"><div><h2>Edit the brief</h2><div className="small muted">Any rep can update it. Every save keeps the previous version.</div></div><button className="btn secondary" onClick={() => setOpen(true)}>Edit brief</button></section>;
  return (
    <section className="card stack">
      <div className="card-head"><h2>Edit the brief</h2><button className="btn ghost" onClick={() => setOpen(false)}>Close</button></div>
      {msg && <div className="notice small">{msg}</div>}
      <div className="stack">
        <h3>Sharpest Signal</h3>
        <div><label htmlFor="sharp">Signal</label><textarea id="sharp" value={sharp} onChange={e => setSharp(e.target.value)} rows={3} /></div>
        <div><label htmlFor="why">Why it gets the call</label><textarea id="why" value={why} onChange={e => setWhy(e.target.value)} rows={2} /></div>
        <div><button className="btn" disabled={busy} onClick={() => save("sharpest")}>Save Sharpest Signal</button></div>
      </div>
      <hr style={{ border: 0, borderTop: "1px solid var(--line)", width: "100%" }} />
      <div className="stack">
        <h3>Add a line</h3>
        <div className="field-grid">
          <div><label htmlFor="sec">Section</label><select id="sec" value={section} onChange={e => setSection(e.target.value)}>{SECTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label htmlFor="tagsel">Label</label><select id="tagsel" value={tag} onChange={e => setTag(e.target.value)}><option value="inferred">Inferred (a guess to ask about)</option><option value="verified">Verified (has a source)</option></select></div>
        </div>
        <div><label htmlFor="line">Line</label><textarea id="line" value={text} onChange={e => setText(e.target.value)} rows={2} placeholder="e.g. Ships about 40 flatbed loads a week out of the Nashville DC in April." /></div>
        {tag === "verified" && <div className="field-grid">
          <div><label htmlFor="srcurl">Source URL</label><input id="srcurl" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://" /></div>
          <div><label htmlFor="srctitle">Source title</label><input id="srctitle" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Press release, call notes, posting…" /></div>
        </div>}
        <div><button className="btn" disabled={busy} onClick={() => save("line")}>Add line</button></div>
      </div>
    </section>
  );
}

export function AddContact({ accountId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", title: "", role_type: "Logistics", linkedin_url: "", email: "", phone: "", contact_source: "crm", why: "" });
  const [err, setErr] = useState("");
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }));
  if (!open) return <button className="btn secondary" onClick={() => setOpen(true)}>+ Create new contact</button>;
  return (
    <form className="stack" onSubmit={async e => {
      e.preventDefault(); setErr("");
      try { const r = await api("/api/contacts", "POST", { ...f, account_id: accountId }); router.push(`/accounts/${accountId}/contacts/${r.id}`); }
      catch (e2) { setErr(e2.message); }
    }}>
      {err && <div className="notice err small">{err}</div>}
      <div><label htmlFor="c-title">Title (required)</label><input id="c-title" type="text" value={f.title} onChange={set("title")} required /></div>
      <div><label htmlFor="c-name">Name</label><input id="c-name" type="text" value={f.name} onChange={set("name")} /></div>
      <div><label htmlFor="c-role">Position type</label><select id="c-role" value={f.role_type} onChange={set("role_type")}>{["Executive", "Supply Chain", "Logistics", "Procurement", "Operations"].map(r => <option key={r}>{r}</option>)}</select></div>
      <div><label htmlFor="c-src">Where this contact info came from</label><select id="c-src" value={f.contact_source} onChange={set("contact_source")}><option value="crm">From CRM</option><option value="public">Public source</option><option value="rep">Rep entered</option></select></div>
      <div><label htmlFor="c-email">Business email</label><input id="c-email" type="email" value={f.email} onChange={set("email")} /></div>
      <div><label htmlFor="c-phone">Phone</label><input id="c-phone" type="tel" value={f.phone} onChange={set("phone")} /></div>
      <div><label htmlFor="c-li">LinkedIn URL</label><input id="c-li" type="url" value={f.linkedin_url} onChange={set("linkedin_url")} /></div>
      <div><label htmlFor="c-why">Why they matter</label><textarea id="c-why" value={f.why} onChange={set("why")} rows={2} /></div>
      <div className="row"><button className="btn" type="submit">Save contact</button><button className="btn ghost" type="button" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>
  );
}
