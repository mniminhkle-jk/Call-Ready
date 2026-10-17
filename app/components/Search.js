"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

const ROLE_TYPES = ["Executive", "Supply Chain", "Logistics", "Procurement", "Operations"];
const STAGES = ["Research", "Outreach", "Connected", "Discovery", "Lane test / Quote", "Active shipper", "Closed lost"];

export default function Search({ accounts }) {
  const [q, setQ] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [segment, setSegment] = useState("");
  const [stage, setStage] = useState("");
  const [level, setLevel] = useState("");
  const { people, companies } = useMemo(() => {
    const term = q.trim().toLowerCase();
    const acc = accounts.filter(a => (!company || a.id === company) && (!segment || a.segment === segment) && (!stage || a.stage === stage) && (!level || a.level === level));
    const people = [];
    for (const a of acc) for (const c of a.contacts) {
      if (role && c.role_type !== role) continue;
      if (term && !`${c.name || ""} ${c.title} ${a.name} ${c.location || ""}`.toLowerCase().includes(term)) continue;
      people.push({ ...c, account: a });
    }
    const companies = acc.filter(a => !role && (!term || `${a.name} ${a.hq} ${a.segment}`.toLowerCase().includes(term)));
    return { people, companies };
  }, [accounts, q, company, role, segment, stage, level]);
  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="card stack">
        <label htmlFor="q" className="sr">Search</label>
        <input id="q" type="search" placeholder="Search a name, title, company or city (try “transportation” or “Pirelli”)" value={q} onChange={e => setQ(e.target.value)} style={{ fontSize: 16, padding: "12px 14px" }} />
        <div className="filters">
          <Select id="f-company" label="Company" value={company} onChange={setCompany} options={accounts.map(a => [a.id, a.name])} />
          <Select id="f-role" label="Position" value={role} onChange={setRole} options={ROLE_TYPES.map(r => [r, r])} />
          <Select id="f-segment" label="Segment" value={segment} onChange={setSegment} options={["Manufacturer", "Distributor", "Retailer"].map(s => [s, s])} />
          <Select id="f-stage" label="Stage" value={stage} onChange={setStage} options={STAGES.map(s => [s, s])} />
          <Select id="f-level" label="Criticality" value={level} onChange={setLevel} options={[["red", "Act now"], ["yellow", "This week"], ["green", "On track"]]} />
        </div>
      </div>
      {companies.length > 0 && <section className="stack">
        <h2>Companies<span className="count">{companies.length}</span></h2>
        <div className="results">{companies.map(a => (
          <Link key={a.id} href={`/accounts/${a.id}`} className="result">
            <div style={{ minWidth: 0 }} className="stack">
              <div className="row" style={{ gap: 8 }}><span className="title" style={{ fontSize: 17 }}>{a.name}</span><span className="pill">{a.segment}</span><span className="pill">{a.stage}</span><span className="small muted">{a.hq}</span></div>
              <div className="small">{a.overview}</div>
              <div className="small muted">{a.contacts.length} contacts: {a.contacts.map(c => c.name || c.title).join(", ")}</div>
            </div>
            <div className="stack" style={{ alignItems: "flex-end", gap: 6 }}><span className={`chip ${a.level}`}>{a.label}</span><span className="small muted" style={{ maxWidth: 220, textAlign: "right" }}>{a.reason}</span></div>
          </Link>))}</div>
      </section>}
      {people.length > 0 && <section className="stack">
        <h2>People<span className="count">{people.length}</span></h2>
        <div className="results">{people.map(p => (
          <Link key={p.id} href={`/accounts/${p.account.id}/contacts/${p.id}`} className="result">
            <div style={{ minWidth: 0 }}>
              <div className="title">{p.name || <span className="muted">Name not on file</span>} <span className="muted" style={{ fontWeight: 400 }}>· {p.title}</span></div>
              <div className="small muted">{p.account.name} · {p.role_type}{p.location ? ` · ${p.location}` : ""}</div>
            </div>
            <div className="row" style={{ gap: 6 }}>{p.bestScore != null && <span className="pill">practice {p.bestScore}</span>}<span className="pill">{p.status}</span></div>
          </Link>))}</div>
      </section>}
      {!people.length && !companies.length && <div className="card muted">No matches. Clear a filter, or <Link href="/new">add a new account</Link>.</div>}
    </div>
  );
}
function Select({ id, label, value, onChange, options }) {
  return <div><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={e => onChange(e.target.value)}><option value="">All</option>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>;
}
