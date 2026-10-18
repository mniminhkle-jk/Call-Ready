import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/app/components/Shell";
import SetupNeeded from "@/app/components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, accountBundle } from "@/lib/data";
import { StageSelect, MarkReviewed, SignalsPanel, AddFact, AddContact } from "@/app/components/AccountActions";
import ActivityFeed from "@/app/components/ActivityFeed";
import CopyButton from "@/app/components/CopyButton";

export const dynamic = "force-dynamic";
const initials = n => (n || "?").split(" ").map(x => x[0]).slice(0, 2).join("");

export default async function AccountPage({ params }) {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/accounts"><SetupNeeded status={status} /></Shell>;
  const bundle = await accountBundle(params.id);
  if (!bundle) notFound();
  const { account: a, contacts, signals, activity, deals, assessment } = bundle;
  const b = a.brief || {};
  const Src = ({ n }) => { const s = b.sources?.find(x => x.n === n); return s ? <a className="src" href={s.url} target="_blank" rel="noreferrer" title={s.title} aria-label={`Source ${n}: ${s.title}`}>[{n}]</a> : null; };
  const facts = b.facts || [];
  return (
    <Shell user={user} active="/accounts">
      <nav aria-label="Breadcrumb" className="row small"><Link href="/accounts">Accounts</Link><span className="muted" aria-hidden="true">/</span><span aria-current="page">{a.name}</span></nav>
      <div className="hero">
        <div style={{ maxWidth: 760 }}>
          <h1>{a.name}</h1>
          <p className="sub">{[a.segment, a.hq, a.ticker].filter(Boolean).join(" · ")}</p>
          {b.overview && <p className="clamp2" style={{ margin: "8px 0 0" }}>{b.overview}</p>}
        </div>
        <div className="stack" style={{ alignItems: "flex-end", gap: 8 }}>
          <StageSelect id={a.id} stage={a.stage} />
          <span className={`chip ${assessment.level}`}>{assessment.label}</span>
          {assessment.reasons[0] && <span className="small muted" style={{ maxWidth: 280, textAlign: "right" }}>{assessment.reasons[0].text}</span>}
        </div>
      </div>

      <section className="card stack" id="contacts" aria-labelledby="h-contacts">
        <div className="section-title"><h2 id="h-contacts">Contacts<span className="count">{contacts.length}</span></h2></div>
        <div className="people-grid">
          {contacts.map((c, i) => <Link key={c.id} href={`/accounts/${a.id}/contacts/${c.id}`} className="person-card" data-guide={i === 0 ? "first-contact" : undefined}>
            <div className="row" style={{ gap: 10, flexWrap: "nowrap" }}><span className="avatar" aria-hidden="true">{initials(c.name || c.title)}</span><div style={{ minWidth: 0 }}><div className="nm">{c.name || "Name not on file"}</div><div className="small muted clamp2">{c.title}</div></div></div>
            <div className="row" style={{ gap: 6 }}><span className="pill">{c.cs.label}</span></div>
          </Link>)}
        </div>
        <AddContact accountId={a.id} />
      </section>

      <div className="grid-main">
        <div className="stack" style={{ gap: 16 }}>
          <section className="card" aria-labelledby="h-glance">
            <h2 id="h-glance">At a glance</h2>
            {((a.phones || [])[0] || a.website) && <p className="small" style={{ margin: "0 0 10px" }}>{(a.phones || [])[0] && <>Main line <span className="mono">{a.phones[0].number}</span></>}{(a.phones || [])[0] && a.website && " · "}{a.website && <a href={a.website} target="_blank" rel="noreferrer">{a.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a>}</p>}
            <dl className="kv">{facts.slice(0, 4).map((f, i) => <Fragment key={i}><dt>{f.label}</dt><dd>{f.text} <Src n={f.src} /></dd></Fragment>)}</dl>
            <details className="more">
              <summary>More about {a.name}</summary>
              <div className="stack" style={{ gap: 14, marginTop: 10 }}>
                {facts.length > 4 && <dl className="kv">{facts.slice(4).map((f, i) => <Fragment key={i}><dt>{f.label}</dt><dd>{f.text} <Src n={f.src} /></dd></Fragment>)}</dl>}
                {(b.freight || []).length > 0 && <div><h3>Freight</h3><dl className="kv">{b.freight.map((f, i) => <Fragment key={i}><dt>{f.label}</dt><dd>{f.text} <Src n={f.src} /></dd></Fragment>)}</dl></div>}
                {(b.locations || []).length > 0 && <div><h3>Locations</h3><ul className="list">{b.locations.map((l, i) => <li key={i}>{l.text} <Src n={l.src} /></li>)}</ul></div>}
                {(b.leadership || []).length > 0 && <div><h3>Leadership</h3><ul className="list">{b.leadership.map((l, i) => <li key={i}>{l.name}, {l.title} <Src n={l.src} /></li>)}</ul></div>}
                {(b.address || (a.phones || []).length > 0) && <div><h3>Company lines</h3><dl className="kv">
                  {b.address && <><dt>Address</dt><dd>{b.address}</dd></>}
                  {(a.phones || []).map((p, i) => <Fragment key={i}><dt>{i === 0 ? "Phone" : ""}</dt><dd className="row" style={{ gap: 8 }}><span className="mono">{p.number}</span><span className="muted small">{p.label}</span><CopyButton text={p.number} label="Copy" className="btn ghost" /></dd></Fragment>)}
                </dl></div>}
                <div><h3>Sources</h3><ol className="small" style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>{(b.sources || []).map(s => <li key={s.n} value={s.n}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> <span className="muted">({s.date})</span></li>)}</ol></div>
                <MarkReviewed id={a.id} />
              </div>
            </details>
            <div style={{ marginTop: 10 }}><AddFact id={a.id} /></div>
          </section>

        </div>
        <aside className="stack" style={{ gap: 16 }}>
          <SignalsPanel id={a.id} signals={signals} checkedAt={a.signals_checked_at} />
          <ActivityFeed items={activity} deals={deals} />
        </aside>
      </div>
    </Shell>
  );
}
