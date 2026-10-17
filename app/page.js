import Link from "next/link";
import Shell from "./components/Shell";
import SetupNeeded from "./components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, hubData, dashboardData } from "@/lib/data";
import { fmtDate, fmtDateTime } from "./components/api";

export const dynamic = "force-dynamic";
const money = n => `$${Math.round(n).toLocaleString("en-US")}`;
const initials = n => (n || "?").split(" ").map(x => x[0]).slice(0, 2).join("");

function Action({ a, c, why, cta, href, extra }) {
  return (
    <div className="action">
      <div style={{ minWidth: 0 }}>
        <div className="who-line">{c ? <Link href={`/accounts/${a.id}/contacts/${c.id}`}>{c.name || c.title}</Link> : <Link href={`/accounts/${a.id}`}>{a.name}</Link>}{c && <span className="muted" style={{ fontWeight: 400 }}> · {c.title} · {a.name}</span>}</div>
        <div className="why">{why}</div>
        {extra}
      </div>
      <Link className="btn secondary" href={href}>{cta}</Link>
    </div>
  );
}

export default async function Hub() {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/"><SetupNeeded status={status} /></Shell>;
  const [{ actions, activity, accounts }, dash] = await Promise.all([hubData(), dashboardData()]);
  const me = dash.reps.find(r => r.name === user?.name) || dash.reps.find(r => r.id === user?.username);
  const people = accounts.flatMap(a => a.contacts);
  const weekAgo = Date.now() - 7 * 864e5;
  const myWeek = activity.filter(x => x.actor === user?.name && new Date(x.created_at).getTime() > weekAgo);
  return (
    <Shell user={user} active="/">
      <div className="row spread">
        <div><div className="eyebrow">Main Hub · {fmtDate(new Date())}</div><h1>Good to see you, {user?.name?.split(" ")[0]}. Here's today.</h1></div>
        <Link className="btn" href="/accounts">Find a prospect</Link>
      </div>

      <div className="tiles">
        <div className="tile"><span className="l">My margin, October MTD {dash.isSample && <span className="sample-badge" style={{ marginLeft: 6 }}>sample</span>}</span><span className="v">{me ? `${me.attainment}%` : "—"}</span><span className="s">{me ? `${money(me.margin)} of ${money(me.monthly_quota)} quota` : "No quota on file"}</span><div className="meter" aria-hidden><span style={{ width: `${Math.min(100, me?.attainment || 0)}%` }} /></div></div>
        <div className="tile"><span className="l">To reach out</span><span className="v">{actions.reach.length}</span><span className="s">people not contacted yet</span></div>
        <div className="tile"><span className="l">Follow-ups</span><span className="v">{actions.follow.length}</span><span className="s">{actions.follow.filter(f => f.rank >= 10).length} overdue</span></div>
        <div className="tile"><span className="l">My activity, 7 days</span><span className="v">{myWeek.length}</span><span className="s">{myWeek.filter(x => /notes/i.test(x.action)).length} call(s) logged · {myWeek.filter(x => /Sent/.test(x.action)).length} sent</span></div>
      </div>

      <div className="grid-main">
        <div className="stack" style={{ gap: 16 }}>
          <section className="card">
            <div className="card-head"><h2>Reach out today<span className="count">{actions.reach.length}</span></h2><span className="small muted">Ranked by account signals and role fit</span></div>
            {actions.reach.slice(0, 6).map((x, i) => <Action key={i} a={x.account} c={x.contact} why={x.why} cta="Draft email" href={`/accounts/${x.account.id}/contacts/${x.contact.id}#outreach`} />)}
            {!actions.reach.length && <p className="muted">Everyone on your list has been contacted.</p>}
          </section>
          <section className="card">
            <div className="card-head"><h2>Follow up<span className="count">{actions.follow.length}</span></h2><span className="small muted">PRN next steps and unanswered emails</span></div>
            {actions.follow.slice(0, 6).map((x, i) => <Action key={i} a={x.account} c={x.contact} why={x.why} cta={x.rank >= 10 ? "Do it now" : "Open"} href={`/accounts/${x.account.id}/contacts/${x.contact.id}`} extra={x.due ? <span className={`chip ${x.rank >= 10 ? "red" : "yellow"}`} style={{ marginTop: 4 }}>due {x.due}</span> : null} />)}
            {!actions.follow.length && <p className="muted">No follow-ups due. Log a call and its next steps show up here.</p>}
          </section>
          <section className="card">
            <div className="card-head"><h2>Practice before you dial<span className="count">{actions.practice.length}</span></h2><Link href="/training" className="small">See Training</Link></div>
            {actions.practice.slice(0, 4).map((x, i) => <Action key={i} a={x.account} c={x.contact} why={x.why} cta="Mock call" href={`/accounts/${x.account.id}/contacts/${x.contact.id}/mock`} />)}
          </section>
        </div>
        <aside className="stack" style={{ gap: 16 }}>
          <section className="card stack">
            <h2>Accounts to watch</h2>
            {accounts.map(a => <Link key={a.id} href={`/accounts/${a.id}`} className="result" style={{ padding: "10px 12px" }}>
              <div style={{ minWidth: 0 }}><div className="title">{a.name}</div><div className="small muted">{a.assessment.reasons[0]?.text || "Nothing flagged"}</div></div>
              <span className={`chip ${a.assessment.level}`}>{a.assessment.label}</span>
            </Link>)}
          </section>
          {actions.refresh.length > 0 && <section className="card stack small">
            <h2>Refresh research</h2>
            <ul className="list">{actions.refresh.map((x, i) => <li key={i}><Link href={`/accounts/${x.account.id}`}>{x.account.name}</Link>: {x.why}</li>)}</ul>
          </section>}
          <section className="card stack small">
            <h2>Team activity</h2>
            <ul className="timeline">{activity.slice(0, 8).map(x => <li key={x.id}><b>{x.actor}</b> {x.action.toLowerCase()}{x.detail ? `: ${x.detail}` : ""}<div className="muted">{fmtDateTime(x.created_at)}</div></li>)}</ul>
            <Link href="/dashboards">Open dashboards</Link>
          </section>
          <section className="card small muted">{people.length} people across {accounts.length} accounts · data syncs to Salesforce or HubSpot from <Link href="/crm">CRM sync</Link>.</section>
        </aside>
      </div>
    </Shell>
  );
}
