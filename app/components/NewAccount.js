"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
export default function NewAccount() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", website: "", segment: "Manufacturer", hq: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = k => e => setF(s => ({ ...s, [k]: e.target.value }));
  return (
    <form className="card stack" style={{ maxWidth: 640 }} onSubmit={async e => {
      e.preventDefault(); setErr(""); setBusy(true);
      try { const r = await api("/api/accounts", "POST", f); router.push(`/accounts/${r.id}`); }
      catch (e2) { setErr(e2.message); setBusy(false); }
    }}>
      {err && <div className="notice err small">{err}</div>}
      <div><label htmlFor="a-name">Company name</label><input id="a-name" type="text" value={f.name} onChange={set("name")} placeholder="e.g. Builders FirstSource" required /></div>
      <div className="field-grid">
        <div><label htmlFor="a-seg">Segment</label><select id="a-seg" value={f.segment} onChange={set("segment")}><option>Manufacturer</option><option>Distributor</option><option>Retailer</option></select></div>
        <div><label htmlFor="a-hq">Headquarters</label><input id="a-hq" type="text" value={f.hq} onChange={set("hq")} placeholder="City, ST" /></div>
      </div>
      <div><label htmlFor="a-web">Website</label><input id="a-web" type="url" value={f.website} onChange={set("website")} placeholder="https://" /></div>
      <div><button className="btn" type="submit" disabled={busy}>{busy ? "Researching with Exa… (up to a minute)" : "Create account and run research"}</button></div>
    </form>
  );
}
