import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/app/components/Shell";
import SetupNeeded from "@/app/components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, accountBundle } from "@/lib/data";
import { STALE_RULES } from "@/lib/rules";
import { fmtDate, fmtDateTime } from "@/app/components/api";
import { StageSelect, MarkReviewed, SignalsPanel, AddFact, AddContact } from "@/app/components/AccountActions";
import CopyButton from "@/app/components/CopyButton";

export const dynamic = "force-dynamic";
const initials = n => (n || "?").split(" ").map(x => x[0]).slice(0, 2).join("");
const money = n => `$${Math.round(n).toLocaleString("en-US")}`;

export default async function AccountPage({ params }) {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/accounts"><SetupNeeded status={status} /></Shell>;
  const bundle = await accountBundle(params.id);
  if (!bundle) notFound();
  const { account: a, contacts, signals, notes, activity, deals, assessment } = bundle;
  const b = a.brief || {};
  const src = n => b.sources?.find(s => s.n === n);
  const Src = ({ n }) => { const s = src(n); return s ? <a className="src" href={s.url} target="_blank" rel="noreferrer" title={s.title}>[{n}]</a> : null; };
  return (
    <Shell user={user} active="/accounts">
      <div className="row small"><Link href="/accounts">← Accounts</Link></div>
      <div className="row spread" style={{ alignItems: "flex-start" }}>
        <div className="stack" style={{ gap: 6, maxWidth: 780 }}>
          <div className="eyebrow">Company profile · {[a.segment, a.hq, a.ticker].filter(Boolean).join(" · ")}</div>
          <h1>{a.name}</h1>
          {b.overview && <p style={{ margin: 0 }}>{b.overview}</p>}
          <div className="row small muted" style={{ gap: 14 }}>
            <span>Profile reviewed {a.refreshed_at ? fmtDate(a.refreshed_at) : "never"}</span>
            <span>Last touch: {a.last_touched_at ? fmtDate(a.last_touched_at) : "none yet"}</span>
            {a.website && <a href={a.website} target="_blank" rel="noreferrer">Website</a>}
          </div>
        </div>
        <div className="stack" style={{ alignItems: "flex-end", gap: 10 }}>
          <StageSelect id={a.id} stage={a.stage} />
          <span className={`chip ${assessment.level}`}>{assessment.label}</span>
        </div>
      </div>

      <section className="card stack" id="contacts">
        <div className="card-head" style={{ marginBottom: 0 }}><h2>Contacts<span className="count">{contacts.length}</span></h2><span className="small muted">Open a person for their contact info, researched brief, .docx and mock call.</span></div>
        <div className="people-grid">
          {contacts.map(c => <Link key={c.id} href={`/accounts/${a.id}/contacts/${c.id}`} className="person-card">
            <div className="row" style={{ gap: 10, flexWrap: "nowrap" }}><span className="avatar" aria-hidden>{initials(c.name || c.title)}</span><div style={{ minWidth: 0 }}><div className="nm">{c.name || "Name not on file"}</div><div className="small muted">{c.title}</div></div></div>
            <div className="small muted">{c.role_type}{c.location ? ` · ${c.location}` : ""}</div>
            <div className="row" style={{ gap: 6 }}><span className="pill">{c.cs.label}</span>{c.bestScore != null && <span className="pill">practice {c.bestScore}</span>}</div>
          </Link>)}
        </div>
        <AddContact accountId={a.id} />
      </section>

      <div className="grid-main">
        <div className="stack" style={{ gap: 16 }}>
          <section className="card">
            <h2>Company contact</h2>
            <dl className="kv">
              {b.address && <Fragment><dt>Address</dt><dd>{b.address}</dd></Fragment>}
              {(a.phones || []).map((p, i) => <Fragment key={`ph${i}`}><dt>{i === 0 ? "Phone" : ""}</dt><dd className="row" style={{ gap: 8 }}><span className="mono">{p.number}</span><span className="muted small">{p.label}</span><CopyButton text={p.number} label="Copy" className="btn ghost" /><a className="src" href={p.src} target="_blank" rel="noreferrer">[source]</a></dd></Fragment>)}
              {a.website && <Fragment><dt>Website</dt><dd><a href={a.website} target="_blank" rel="noreferrer">{a.website.replace(/^https?:\/\//, "")}</a></dd></Fragment>}
              {(b.leadership || []).map((l, i) => <Fragment key={`ld${i}`}><dt>{i === 0 ? "Leadership" : ""}</dt><dd>{l.name}, {l.title} <Src n={l.src} /></dd></Fragment>)}
            </dl>
          </section>

          <section className="card">
            <h2>What we found</h2>
            <dl className="kv">{(b.facts || []).map((f, i) => <Fragment key={`f${i}`}><dt>{f.label}</dt><dd>{f.text} <Src n={f.src} /></dd></Fragment>)}</dl>
          </section>

          {(b.freight || []).length > 0 && <section className="card">
            <h2>Freight facts</h2>
            <dl className="kv">{b.freight.map((f, i) => <Fragment key={`fr${i}`}><dt>{f.label}</dt><dd>{f.text} <Src n={f.src} /></dd></Fragment>)}</dl>
          </section>}

          {(b.locations || []).length > 0 && <section className="card">
            <h2>Locations</h2>
            <ul className="list">{b.locations.map((l, i) => <li key={i}>{l.text} <Src n={l.src} /></li>)}</ul>
          </section>}

          <section className="card stack">
            <h2>Call notes across this account</h2>
            {notes.length === 0 && <p className="muted small" style={{ margin: 0 }}>No calls logged yet. Notes are logged on each person's profile.</p>}
            <ul className="timeline small">{notes.map(n => { const c = contacts.find(x => x.id === n.contact_id); return <li key={n.id}><b>{n.author}</b> with {c ? <Link href={`/accounts/${a.id}/contacts/${c.id}`}>{c.name || c.title}</Link> : "the account"} · <span className="muted">{fmtDateTime(n.created_at)} · {n.method}</span><div><b>P:</b> {n.prn.purpose}</div>{n.prn.next?.length > 0 && <div><b>N:</b> {n.prn.next.map(s => s.text).join("; ")}</div>}</li>; })}</ul>
          </section>

          {deals.length > 0 && <section className="card">
            <h2>Opportunities</h2>
            <div className="table-wrap"><table><thead><tr><th>Opportunity</th><th>Stage</th><th>Est. margin</th><th>Close</th><th>CRM</th></tr></thead><tbody>
              {deals.map(d => <tr key={d.id}><td>{d.name}{d.is_sample && <span className="sample-badge" style={{ marginLeft: 6 }}>sample</span>}</td><td>{d.stage}</td><td className="mono">{money(d.margin)}</td><td className="mono small">{d.close_date}</td><td className="small muted">{d.sf_id ? `SF ${d.sf_id}` : d.hubspot_id ? `HS ${d.hubspot_id}` : "not synced"}</td></tr>)}
            </tbody></table></div>
          </section>}

          <AddFact id={a.id} />

          <section className="card">
            <h2>Sources</h2>
            <ol className="small" style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>{(b.sources || []).map(s => <li key={s.n} value={s.n}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> <span className="muted">({s.date})</span></li>)}</ol>
          </section>
        </div>
        <aside className="stack" style={{ gap: 16 }}>
          <section className="card stack">
            <div className="card-head" style={{ marginBottom: 0 }}><h2>Criticality</h2><span className={`chip ${assessment.level}`}>{assessment.label}</span></div>
            <ul className="reasons">{assessment.reasons.length ? assessment.reasons.map((r, i) => <li key={i}><b>{r.rule}</b>{r.text}</li>) : <li>Nothing flagged.</li>}</ul>
            <details className="small muted"><summary>Rules</summary><p>Time: profile over {STALE_RULES.briefYellowDays} days = yellow, over {STALE_RULES.briefRedDays} = red. Event: unreviewed freight signal in the last {STALE_RULES.freshSignalDays} days. Activity: no touch in {STALE_RULES.contactGapDays} days ({STALE_RULES.activeStageGapDays} on active deals), or overdue next steps.</p></details>
            <MarkReviewed id={a.id} />
          </section>
          <SignalsPanel id={a.id} signals={signals} checkedAt={a.signals_checked_at} />
          <section className="card stack small">
            <h2>CRM</h2>
            <div>Salesforce Account: <span className="mono">{a.sf_id || "not synced"}</span></div>
            <div>HubSpot Company: <span className="mono">{a.hubspot_id || "not synced"}</span></div>
            <Link href="/crm">Sync or export</Link>
          </section>
          <section className="card stack small">
            <h2>Activity</h2>
            <ul className="timeline">{activity.slice(0, 15).map(x => <li key={x.id}><b>{x.actor}</b> {x.action.toLowerCase()}{x.detail ? `: ${x.detail}` : ""}<div className="muted">{fmtDateTime(x.created_at)}</div></li>)}</ul>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
