"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import CopyButton from "./CopyButton";

const SRC = { public: "Public source", crm: "From CRM", rep: "Rep entered" };

export default function ContactPanel({ contact: c }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ name: c.name || "", title: c.title || "", email: c.email || "", phone: c.phone || "", linkedin_url: c.linkedin_url || "", contact_source: c.contact_source || "rep" });
  const [hook, setHook] = useState({ text: "", say: "", src: "", type: "professional", confirmed: false });
  const [msg, setMsg] = useState("");
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }));
  const liSearch = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${c.name || c.title}`)}`;

  async function save(e) { e.preventDefault(); try { await api(`/api/contacts/${c.id}`, "PATCH", f); setEdit(false); setMsg("Saved."); router.refresh(); } catch (err) { setMsg(err.message); } }
  async function addHook(e) { e.preventDefault(); try { await api(`/api/contacts/${c.id}`, "PATCH", { addHook: hook }); setHook({ text: "", say: "", src: "", type: "professional", confirmed: false }); setMsg("Hook added."); router.refresh(); } catch (err) { setMsg(err.message); } }
  async function confirm(i) { await api(`/api/contacts/${c.id}`, "PATCH", { confirmHook: i }).catch(e => setMsg(e.message)); router.refresh(); }

  return (
    <>
      <section className="card stack">
        <div className="card-head" style={{ marginBottom: 0 }}><h2>Contact</h2><button className="btn ghost" onClick={() => setEdit(v => !v)}>{edit ? "Cancel" : "Edit"}</button></div>
        {msg && <div className="notice small">{msg}</div>}
        {!edit ? <div className="stack small">
          <div><span className="muted">Email</span><br />{c.email ? <span className="row" style={{ gap: 6 }}><span className="mono">{c.email}</span><CopyButton text={c.email} label="Copy" className="btn ghost" /></span> : <span className="muted">Not on file. Add from CRM.</span>}</div>
          <div><span className="muted">Phone</span><br />{c.phone ? <span className="row" style={{ gap: 6 }}><span className="mono">{c.phone}</span><CopyButton text={c.phone} label="Copy" className="btn ghost" /></span> : <span className="muted">Not on file. Add from CRM.</span>}</div>
          <div><span className="muted">LinkedIn</span><br />{c.linkedin_url ? <a href={c.linkedin_url} target="_blank" rel="noreferrer">Open profile</a> : <a href={liSearch} target="_blank" rel="noreferrer">Search LinkedIn for this role</a>}</div>
          <div><span className="pill">{SRC[c.contact_source] || "Rep entered"}</span></div>
          <p className="muted" style={{ margin: 0 }}>Only business contact info from public pages or your CRM. No scraped personal emails or cell numbers.</p>
        </div> :
        <form className="stack" onSubmit={save}>
          <div><label htmlFor="e-name">Name</label><input id="e-name" type="text" value={f.name} onChange={set("name")} /></div>
          <div><label htmlFor="e-title">Title</label><input id="e-title" type="text" value={f.title} onChange={set("title")} required /></div>
          <div><label htmlFor="e-email">Business email</label><input id="e-email" type="email" value={f.email} onChange={set("email")} /></div>
          <div><label htmlFor="e-phone">Phone</label><input id="e-phone" type="tel" value={f.phone} onChange={set("phone")} /></div>
          <div><label htmlFor="e-li">LinkedIn URL</label><input id="e-li" type="url" value={f.linkedin_url} onChange={set("linkedin_url")} /></div>
          <div><label htmlFor="e-src">Source</label><select id="e-src" value={f.contact_source} onChange={set("contact_source")}><option value="crm">From CRM</option><option value="public">Public source</option><option value="rep">Rep entered</option></select></div>
          <button className="btn" type="submit">Save contact</button>
        </form>}
      </section>

      <section className="card stack">
        <h2>Connect hooks</h2>
        <p className="small muted" style={{ margin: 0 }}>Public, professional details you can open with. Personal background (a past career, a hometown) stays locked until a rep confirms it came from the person's own public post.</p>
        <ul className="timeline small">
          {(c.hooks || []).length === 0 && <li className="muted">None yet.</li>}
          {(c.hooks || []).map((h, i) => <li key={i}>
            <div className="row" style={{ gap: 6 }}><span className="pill">{h.type}</span>{h.type === "personal" && (h.confirmed ? <span className="chip green">confirmed</span> : <span className="chip yellow">needs confirmation</span>)}</div>
            {h.text} <a className="src" href={h.src} target="_blank" rel="noreferrer">[source]</a>
            {h.type === "personal" && !h.confirmed && <div><button className="btn ghost small" onClick={() => confirm(i)}>I checked the source. Use it.</button></div>}
          </li>)}
        </ul>
        <form className="stack small" onSubmit={addHook}>
          <div><label htmlFor="h-text">What you found</label><textarea id="h-text" rows={2} value={hook.text} onChange={e => setHook(s => ({ ...s, text: e.target.value }))} placeholder="Posted about a new cross-dock opening in Dallas (Oct 2026)" /></div>
          <div><label htmlFor="h-say">How you'd say it (optional)</label><input id="h-say" type="text" value={hook.say} onChange={e => setHook(s => ({ ...s, say: e.target.value }))} placeholder="I saw your post about the new Dallas cross-dock." /></div>
          <div><label htmlFor="h-src">Public URL</label><input id="h-src" type="url" value={hook.src} onChange={e => setHook(s => ({ ...s, src: e.target.value }))} /></div>
          <div><label htmlFor="h-type">Type</label><select id="h-type" value={hook.type} onChange={e => setHook(s => ({ ...s, type: e.target.value }))}><option value="professional">Professional (their post, talk, quote)</option><option value="personal">Personal background</option></select></div>
          {hook.type === "personal" && <label className="row" style={{ gap: 6, fontWeight: 400 }}><input type="checkbox" checked={hook.confirmed} onChange={e => setHook(s => ({ ...s, confirmed: e.target.checked }))} /> They shared this publicly themselves, and it's relevant.</label>}
          <button className="btn secondary" type="submit">Add hook</button>
        </form>
      </section>
    </>
  );
}
