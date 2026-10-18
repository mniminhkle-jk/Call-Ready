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
        <input id="q" type="search" data-guide="search" placeholder="Search by name, title or company" value={q} onChange={e => setQ(e.target.value)} style={{ fontSize: 16, padding: "12px 14px" }} />
        <div className="filters">
          <Select id="f-company" label="Company" value={company} onChange={setCompany} options={accounts.map(a => [a.id, a.name])} />
          <Select id="f-role" label="Position" value={role} onChange={setRole} options={ROLE_TYPES.map(r => [r, r])} />
          <Select id="f-stage" label="Stage" value={stage} onChange={setStage} options={STAGES.map(s => [s, s])} />
        </div>
        <details className="more" open={!!(segment || level)}>
          <summary>More filters</summary>
          <div className="filters" style={{ marginTop: 8 }}>
            <Select id="f-segment" label="Segment" value={segment} onChange={setSegment} options={["Manufacturer", "Distributor", "Retailer"].map(s => [s, s])} />
            <Select id="f-level" label="Priority" value={level} onChange={setLevel} options={[["red", "Act now"], ["yellow", "This week"], ["green", "On track"]]} />
          </div>
        </details>
      </div>
      {companies.length > 0 && <section className="stack">
        <h2>Companies<span className="count" aria-live="polite">{companies.length}</span></h2>
        <div className="results">{companies.map(a => (
          <Link key={a.id} href={`/accounts/${a.id}`} className="result">
            <div style={{ minWidth: 0 }} className="stack">
              <div className="row" style={{ gap: 8 }}><span className="title" style={{ fontSize: 17 }}>{a.name}</span><span className="small muted">{a.segment} · {a.hq} · {a.stage}</span></div>
              <div className="small muted">{a.contacts.length} contacts{a.reason ? ` · ${a.reason}` : ""}</div>
            </div>
            <span className={`chip ${a.level}`} title={a.reason}>{a.label}</span>
          </Link>))}</div>
      </section>}
      {people.length > 0 && <section className="stack">
        <h2>Contacts<span className="count" aria-live="polite">{people.length}</span></h2>
        <div className="results">{people.map(p => (
          <Link key={p.id} href={`/accounts/${p.account.id}/contacts/${p.id}`} className="result">
            <div style={{ minWidth: 0 }}>
              <div className="title">{p.name || <span className="muted">Name not on file</span>} <span className="muted" style={{ fontWeight: 400 }}>· {p.title}</span></div>
              <div className="small muted">{p.account.name} · {p.role_type}{p.location ? ` · ${p.location}` : ""}</div>
            </div>
            <span className="pill">{p.status}</span>
          </Link>))}</div>
      </section>}
      {!people.length && !companies.length && <div className="card muted">No matches. Try a different word or clear a filter. Can't find the company? <Link href="/new">Add it</Link>.</div>}
    </div>
  );
}
function Select({ id, label, value, onChange, options }) {
  return <div><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={e => onChange(e.target.value)}><option value="">All</option>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>;
}
