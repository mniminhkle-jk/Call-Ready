"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, fmtDate } from "./api";
import CopyButton from "./CopyButton";

// Contact strip: phone, email, LinkedIn and last contact. Blank until found, synced from the CRM, or logged by a rep.
export function ContactStrip({ contact: c, lastTouch }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ phone: c.phone || "", email: c.email || "", linkedin_url: c.linkedin_url || "", location: c.location || "" });
  const [err, setErr] = useState("");
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }));
  const Empty = () => <span className="empty-val">Not on file</span>;
  if (edit) return (
    <form className="card stack" onSubmit={async e => { e.preventDefault(); setErr(""); try { await api(`/api/contacts/${c.id}`, "PATCH", { ...f, contact_source: c.contact_source === "public" ? "rep" : c.contact_source }); setEdit(false); router.refresh(); } catch (x) { setErr(x.message); } }}>
      <div className="section-title"><h2>Contact info</h2></div>
      {err && <div className="notice err small" role="alert">{err}</div>}
      <div className="field-grid">
        <div><label htmlFor="cs-phone">Direct phone</label><input id="cs-phone" type="tel" value={f.phone} onChange={set("phone")} placeholder="Leave blank if unknown" /></div>
        <div><label htmlFor="cs-email">Business email</label><input id="cs-email" type="email" value={f.email} onChange={set("email")} placeholder="Leave blank if unknown" /></div>
        <div><label htmlFor="cs-li">LinkedIn URL</label><input id="cs-li" type="url" value={f.linkedin_url} onChange={set("linkedin_url")} /></div>
        <div><label htmlFor="cs-loc">Location</label><input id="cs-loc" type="text" value={f.location} onChange={set("location")} /></div>
      </div>
      <p className="small muted" style={{ margin: 0 }}>Business details only. Don't add personal phone numbers or emails.</p>
      <div className="row"><button className="btn" type="submit">Save contact info</button><button className="btn ghost" type="button" onClick={() => setEdit(false)}>Cancel</button></div>
    </form>
  );
  return (
    <div className="contact-strip" role="group" aria-label="Contact info">
      <div><div className="k">Phone</div><div className="v">{c.phone ? <span className="row" style={{ gap: 4 }}><a className="mono" href={`tel:${c.phone}`}>{c.phone}</a><CopyButton text={c.phone} label="Copy" className="btn ghost" /></span> : <Empty />}</div></div>
      <div><div className="k">Email</div><div className="v">{c.email ? <span className="row" style={{ gap: 4 }}><span className="mono">{c.email}</span><CopyButton text={c.email} label="Copy" className="btn ghost" /></span> : <Empty />}</div></div>
      <div><div className="k">LinkedIn</div><div className="v">{c.linkedin_url ? <a href={c.linkedin_url} target="_blank" rel="noreferrer">View profile</a> : <Empty />}</div></div>
      <div><div className="k">Last contact</div><div className="v">{lastTouch ? fmtDate(lastTouch) : <span className="empty-val">Never</span>}</div></div>
      <div style={{ alignSelf: "center" }}><button type="button" className="btn secondary" onClick={() => setEdit(true)} data-guide="edit-contact">{c.phone || c.email ? "Edit" : "Add phone or email"}</button></div>
    </div>
  );
}

export function ConnectHooks({ contact: c }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [h, setH] = useState({ text: "", say: "", src: "", type: "professional", confirmed: false });
  const [msg, setMsg] = useState("");
  async function add(e) { e.preventDefault(); setMsg(""); try { await api(`/api/contacts/${c.id}`, "PATCH", { addHook: h }); setH({ text: "", say: "", src: "", type: "professional", confirmed: false }); setOpen(false); router.refresh(); } catch (x) { setMsg(x.message); } }
  async function confirm(i) { await api(`/api/contacts/${c.id}`, "PATCH", { confirmHook: i }).catch(x => setMsg(x.message)); router.refresh(); }
  return (
    <section className="card stack" aria-labelledby="h-hooks">
      <h2 id="h-hooks">Ways to connect</h2>
      {(c.hooks || []).length === 0 && <p className="muted small" style={{ margin: 0 }}>None yet. Add something they posted or said publicly.</p>}
      <ul className="timeline small">{(c.hooks || []).map((x, i) => <li key={i}>
        {x.text} <a className="src" href={x.src} target="_blank" rel="noreferrer">[source]</a>
        {x.type === "personal" && !x.confirmed && <div className="row" style={{ gap: 6, marginTop: 4 }}><span className="chip yellow">Personal: check before using</span><button className="btn ghost" onClick={() => confirm(i)}>It's public. Use it.</button></div>}
      </li>)}</ul>
      {msg && <div className="notice err small" role="alert">{msg}</div>}
      {!open ? <div><button className="btn secondary" onClick={() => setOpen(true)}>Add a way to connect</button></div> :
      <form className="stack small" onSubmit={add}>
        <div><label htmlFor="h-text">What you found</label><textarea id="h-text" rows={2} value={h.text} onChange={e => setH(s => ({ ...s, text: e.target.value }))} placeholder="Posted about a new cross-dock opening in Dallas (Oct 2026)" /></div>
        <div><label htmlFor="h-say">How you'd say it (optional)</label><input id="h-say" type="text" value={h.say} onChange={e => setH(s => ({ ...s, say: e.target.value }))} /></div>
        <div><label htmlFor="h-src">Public link</label><input id="h-src" type="url" value={h.src} onChange={e => setH(s => ({ ...s, src: e.target.value }))} required /></div>
        <div><label htmlFor="h-type">Type</label><select id="h-type" value={h.type} onChange={e => setH(s => ({ ...s, type: e.target.value }))}><option value="professional">Professional (their post, talk or quote)</option><option value="personal">Personal background</option></select></div>
        {h.type === "personal" && <label className="row" style={{ gap: 6, fontWeight: 400 }}><input type="checkbox" checked={h.confirmed} onChange={e => setH(s => ({ ...s, confirmed: e.target.checked }))} /> They shared this publicly themselves.</label>}
        <div className="row"><button className="btn" type="submit">Add</button><button className="btn ghost" type="button" onClick={() => setOpen(false)}>Cancel</button></div>
      </form>}
    </section>
  );
}
