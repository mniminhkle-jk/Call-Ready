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

export function MarkReviewed({ id, kind = "account" }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  return (
    <div className="stack" style={{ gap: 6 }}>
      <button className="btn secondary" type="button" onClick={async () => {
        try { await api(kind === "contact" ? `/api/contacts/${id}` : `/api/accounts/${id}`, "PATCH", { markReviewed: true }); setMsg("Marked reviewed today."); router.refresh(); } catch (e) { setMsg(e.message); }
      }}>{kind === "contact" ? "Mark brief reviewed" : "Mark profile reviewed"}</button>
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
  const list = showAll ? visible : visible.slice(0, 3);
  async function refresh() {
    setBusy(true); setMsg("");
    try {
      const r = await api(`/api/accounts/${id}/signals`, "POST");
      setMsg(r.errors?.length ? `Couldn't check for news: ${r.errors[0]}` : r.inserted ? `${r.inserted} new update${r.inserted === 1 ? "" : "s"} found.` : "No new updates since the last check.");
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
      <div className="card-head" style={{ marginBottom: 0 }}><h2>Company news</h2><button className="btn secondary" disabled={busy} onClick={refresh} data-guide="run-exa">{busy ? "Checking…" : "Check for news"}</button></div>
      <div className="small muted">Last checked {checkedAt ? fmtDate(checkedAt) : "never"}</div>
      {msg && <div className="notice small">{msg}</div>}
      <ul className="timeline small">
        {list.map(s => <li key={s.id}>
          <div className="row" style={{ gap: 6 }}><span className="pill">{s.category || "News"}</span>{s.status === "new" && <span className="chip yellow">new</span>}</div>
          <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
          <div className="muted">{s.published_at ? fmtDate(s.published_at) : "date unknown"}</div>
          {s.status === "new" && <div className="row" style={{ gap: 4 }}>
            <button className="btn ghost small" onClick={() => setStatus(s.id, "reviewed")}>Got it</button>
            <button className="btn ghost small" onClick={() => setStatus(s.id, "dismissed")}>Dismiss</button>
          </div>}
        </li>)}
      </ul>
      {visible.length > 3 && <button className="btn ghost" onClick={() => setShowAll(v => !v)}>{showAll ? "Show fewer" : `Show all ${visible.length}`}</button>}
    </section>
  );
}

export function AddFact({ id }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ label: "", text: "", url: "", title: "" });
  const [msg, setMsg] = useState("");
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }));
  if (!open) return <div><button className="btn secondary" onClick={() => setOpen(true)} data-guide="add-fact">Add a fact you found</button></div>;
  return (
    <form className="card stack" onSubmit={async e => {
      e.preventDefault(); setMsg("");
      try { await api(`/api/accounts/${id}`, "PATCH", { addFact: f }); setF({ label: "", text: "", url: "", title: "" }); setMsg("Saved. The previous version is kept in history."); router.refresh(); }
      catch (err) { setMsg(err.message); }
    }}>
      <div className="card-head"><h2>Add something you found</h2><button type="button" className="btn ghost" onClick={() => setOpen(false)}>Close</button></div>
      {msg && <div className="notice small">{msg}</div>}
      <div className="field-grid">
        <div><label htmlFor="af-label">Label</label><input id="af-label" type="text" value={f.label} onChange={set("label")} placeholder="Facility, Hiring, Revenue…" /></div>
        <div><label htmlFor="af-url">Source URL (required)</label><input id="af-url" type="url" value={f.url} onChange={set("url")} placeholder="https://" /></div>
      </div>
      <div><label htmlFor="af-text">Fact</label><textarea id="af-text" rows={2} value={f.text} onChange={set("text")} /></div>
      <div><label htmlFor="af-title">Source title</label><input id="af-title" type="text" value={f.title} onChange={set("title")} /></div>
      <div><button className="btn" type="submit">Save fact</button></div>
    </form>
  );
}

export function PersonBriefEditor({ id, brief }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sharp, setSharp] = useState(brief.sharpest?.text || "");
  const [why, setWhy] = useState(brief.sharpest?.why || "");
  const [text, setText] = useState("");
  const [tag, setTag] = useState("inferred");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  async function save(kind) {
    setMsg("");
    try {
      if (kind === "sharpest") await api(`/api/contacts/${id}`, "PATCH", { sharpest: { text: sharp, why } });
      else { if (tag === "verified" && !url.trim()) throw new Error("A verified line needs a source URL. Otherwise mark it inferred."); await api(`/api/contacts/${id}`, "PATCH", { addLine: { text, tag, url, title } }); setText(""); setUrl(""); setTitle(""); }
      setMsg("Saved. The previous version is kept in brief history."); router.refresh();
    } catch (e) { setMsg(e.message); }
  }
  if (!open) return <div><button className="btn secondary" onClick={() => setOpen(true)}>Edit brief</button> <span className="small muted">Every save keeps the previous version.</span></div>;
  return (
    <section className="card stack">
      <div className="card-head"><h2>Edit this brief</h2><button className="btn ghost" onClick={() => setOpen(false)}>Close</button></div>
      {msg && <div className="notice small">{msg}</div>}
      <div><label htmlFor="pb-sharp">Sharpest Signal</label><textarea id="pb-sharp" rows={3} value={sharp} onChange={e => setSharp(e.target.value)} /></div>
      <div><label htmlFor="pb-why">Why it gets the call</label><textarea id="pb-why" rows={2} value={why} onChange={e => setWhy(e.target.value)} /></div>
      <div><button className="btn" onClick={() => save("sharpest")}>Save Sharpest Signal</button></div>
      <hr style={{ border: 0, borderTop: "1px solid var(--line)", width: "100%" }} />
      <div className="field-grid"><div><label htmlFor="pb-tag">Add to “What we know”</label><select id="pb-tag" value={tag} onChange={e => setTag(e.target.value)}><option value="inferred">Inferred (a guess to ask about)</option><option value="verified">Verified (has a source)</option></select></div></div>
      <div><label htmlFor="pb-line">Line</label><textarea id="pb-line" rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="e.g. Uses 5 core carriers for inbound and tenders through OTM." /></div>
      {tag === "verified" && <div className="field-grid"><div><label htmlFor="pb-url">Source URL</label><input id="pb-url" type="url" value={url} onChange={e => setUrl(e.target.value)} /></div><div><label htmlFor="pb-title">Source title</label><input id="pb-title" type="text" value={title} onChange={e => setTitle(e.target.value)} /></div></div>}
      <div><button className="btn" onClick={() => save("line")}>Add line</button></div>
    </section>
  );
}

export function AddContact({ accountId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", title: "", role_type: "Logistics", linkedin_url: "", email: "", phone: "", contact_source: "crm", why: "" });
  const [err, setErr] = useState("");
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }));
  if (!open) return <div><button className="btn secondary" onClick={() => setOpen(true)} data-guide="add-contact">Add contact</button></div>;
  return (
    <form className="stack" onSubmit={async e => {
      e.preventDefault(); setErr("");
      try { const r = await api("/api/contacts", "POST", { ...f, account_id: accountId }); router.push(`/accounts/${accountId}/contacts/${r.id}`); }
      catch (e2) { setErr(e2.message); }
    }}>
      {err && <div className="notice err small">{err}</div>}
      <div><label htmlFor="c-title">Title (required)</label><input id="c-title" type="text" value={f.title} onChange={set("title")} required /></div>
      <div><label htmlFor="c-name">Name</label><input id="c-name" type="text" value={f.name} onChange={set("name")} /></div>
      <div><label htmlFor="c-loc">Location</label><input id="c-loc" type="text" value={f.location || ""} onChange={set("location")} /></div>
      <div><label htmlFor="c-role">Position type</label><select id="c-role" value={f.role_type} onChange={set("role_type")}>{["Executive", "Supply Chain", "Logistics", "Procurement", "Operations"].map(r => <option key={r}>{r}</option>)}</select></div>
      <div><label htmlFor="c-src">Source</label><select id="c-src" value={f.contact_source} onChange={set("contact_source")}><option value="crm">From CRM</option><option value="public">Public source</option><option value="rep">Rep entered</option></select></div>
      <div><label htmlFor="c-email">Business email (optional)</label><input id="c-email" type="email" value={f.email} onChange={set("email")} /></div>
      <div><label htmlFor="c-phone">Direct phone (optional)</label><input id="c-phone" type="tel" value={f.phone} onChange={set("phone")} /></div>
      <div><label htmlFor="c-li">LinkedIn URL</label><input id="c-li" type="url" value={f.linkedin_url} onChange={set("linkedin_url")} /></div>
      <div><label htmlFor="c-why">Why they matter</label><textarea id="c-why" value={f.why} onChange={set("why")} rows={2} /></div>
      <div className="row"><button className="btn" type="submit">Add contact</button><button className="btn ghost" type="button" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>
  );
}
