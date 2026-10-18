import Link from "next/link";
import Shell from "./components/Shell";
import SetupNeeded from "./components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, hubData, dashboardData } from "@/lib/data";
import { fmtDate } from "./components/api";

export const dynamic = "force-dynamic";
const money = n => `$${Math.round(n).toLocaleString("en-US")}`;
const firstSentence = t => (t || "").split(/(?<=[.!?])\s/)[0];

function Row({ x, cta, href, guide, chip }) {
  const { account: a, contact: c } = x;
  return (
    <li className="action">
      <div style={{ minWidth: 0 }}>
        <div className="who-line clamp1"><Link href={`/accounts/${a.id}/contacts/${c.id}`} data-guide={guide}>{c.name || c.title}</Link><span className="muted" style={{ fontWeight: 400 }}> · {a.name}</span></div>
        <div className="why clamp1">{x.short || x.why}</div>
        {chip}
      </div>
      <Link className="btn secondary" href={href}>{cta}</Link>
    </li>
  );
}

function ActionList({ title, items, render, empty, max = 4 }) {
  return (
    <section className="card" aria-labelledby={`h-${title}`}>
      <div className="section-title"><h2 id={`h-${title}`}>{title}<span className="count">{items.length}</span></h2></div>
      {items.length ? <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{items.slice(0, max).map(render)}</ul> : <p className="muted small" style={{ margin: 0 }}>{empty}</p>}
      {items.length > max && <details className="more"><summary>Show {items.length - max} more</summary><ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{items.slice(max).map(render)}</ul></details>}
    </section>
  );
}

export default async function Hub() {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/"><SetupNeeded status={status} /></Shell>;
  const [{ actions, accounts }, dash] = await Promise.all([hubData(), dashboardData()]);
  const me = dash.reps.find(r => r.id === user?.username) || dash.reps.find(r => r.name === user?.name);
  const reach = actions.reach.map(x => ({ ...x, short: firstSentence(x.contact.brief?.sharpest?.text) }));
  return (
    <Shell user={user} active="/">
      <div className="hero">
        <div><div className="eyebrow">{fmtDate(new Date())}</div><h1>Hi {user?.name?.split(" ")[0]}, here's your day</h1></div>
        <Link className="btn" href="/accounts">Find a contact</Link>
      </div>

      <div className="tiles">
        <Link href="/dashboards" className="tile" style={{ textDecoration: "none", color: "inherit" }}><span className="l">Quota, this month</span><span className="v">{me ? `${me.attainment}%` : "—"}</span><span className="s">{me ? `${money(me.margin)} of ${money(me.monthly_quota)}` : "No quota on file"}</span><div className="meter" aria-hidden="true"><span style={{ width: `${Math.min(100, me?.attainment || 0)}%` }} /></div></Link>
        <div className="tile"><span className="l">To reach out</span><span className="v">{reach.length}</span><span className="s">contacts not reached yet</span></div>
        <div className="tile"><span className="l">Follow-ups</span><span className="v">{actions.follow.length}</span><span className="s">{actions.follow.filter(f => f.rank >= 10).length ? `${actions.follow.filter(f => f.rank >= 10).length} overdue` : "none overdue"}</span></div>
      </div>

      <div className="grid-main">
        <div className="stack" style={{ gap: 16 }}>
          <ActionList title="Reach out today" items={reach} empty="Everyone on your list has been contacted." render={(x, i) => <Row key={x.contact.id} x={x} guide={i === 0 ? "top-reach" : undefined} cta="Draft email" href={`/accounts/${x.account.id}/contacts/${x.contact.id}`} />} />
          <ActionList title="Follow up" items={actions.follow} empty="No follow-ups due. Next steps from your call notes show up here." render={(x, i) => <Row key={i} x={x} cta="Open" href={`/accounts/${x.account.id}/contacts/${x.contact.id}`} chip={x.due ? <span className={`chip ${x.rank >= 10 ? "red" : "yellow"}`} style={{ marginTop: 4 }}>Due {x.due}</span> : null} />} />
          <ActionList title="Practice before you call" items={actions.practice} max={3} empty="You've practiced with everyone on your list." render={(x, i) => <Row key={i} x={{ ...x, short: x.why }} cta="Practice" href={`/accounts/${x.account.id}/contacts/${x.contact.id}/mock`} />} />
        </div>
        <aside className="stack" style={{ gap: 16 }}>
          <section className="card stack" aria-labelledby="h-watch">
            <h2 id="h-watch">Accounts to watch</h2>
            {accounts.map(a => <Link key={a.id} href={`/accounts/${a.id}`} className="result" style={{ padding: "10px 12px" }}>
              <div style={{ minWidth: 0 }}><div className="title">{a.name}</div><div className="small muted clamp1">{a.assessment.reasons[0]?.text || "Nothing flagged"}</div></div>
              <span className={`chip ${a.assessment.level}`}>{a.assessment.label}</span>
            </Link>)}
          </section>
        </aside>
      </div>
    </Shell>
  );
}
