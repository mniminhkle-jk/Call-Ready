import Link from "next/link";
import Shell from "../components/Shell";
import SetupNeeded from "../components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, listAccountsFull } from "@/lib/data";
import { db } from "@/lib/db";
import { fmtDate, fmtDateTime } from "../components/api";
import { STAGES } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function Team() {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/team"><SetupNeeded status={status} /></Shell>;
  const accounts = await listAccountsFull();
  const { data: activity } = await db().from("activity").select("*").order("created_at", { ascending: false }).limit(60);
  const { data: calls } = await db().from("mock_calls").select("rep,score,created_at,account_id").order("created_at", { ascending: false }).limit(50);
  const name = id => accounts.find(a => a.id === id)?.name || id;
  const scored = (calls || []).filter(c => c.score?.total != null);
  const avg = scored.length ? Math.round(scored.reduce((s, c) => s + c.score.total, 0) / scored.length) : null;
  return (
    <Shell user={user} active="/team">
      <div className="stack" style={{ gap: 4 }}>
        <div className="eyebrow">Manager view</div>
        <h1>Team activity and deal status</h1>
        <p className="muted" style={{ margin: 0 }}>Every rep works from the same account record, so notes, stages and briefs stay in one place.</p>
      </div>
      <section className="card">
        <h2>Pipeline</h2>
        <div className="table-wrap"><table>
          <thead><tr><th>Account</th><th>Stage</th><th>Criticality</th><th>Why</th><th>Last touch</th><th>Brief reviewed</th><th>Notes</th></tr></thead>
          <tbody>{accounts.map(a => <tr key={a.id}>
            <td><Link href={`/accounts/${a.id}`}>{a.name}</Link><div className="small muted">{a.segment}</div></td>
            <td>{a.stage}</td>
            <td><span className={`chip ${a.assessment.level}`}>{a.assessment.label}</span></td>
            <td className="small">{a.assessment.reasons[0]?.text || "Nothing flagged"}</td>
            <td className="small mono">{a.last_touched_at ? fmtDate(a.last_touched_at) : "—"}</td>
            <td className="small mono">{a.refreshed_at ? fmtDate(a.refreshed_at) : "—"}</td>
            <td className="mono">{a.notes.length}</td>
          </tr>)}</tbody>
        </table></div>
        <div className="row small muted" style={{ marginTop: 10 }}>{STAGES.map(s => <span key={s} className="pill">{s}: {accounts.filter(a => a.stage === s).length}</span>)}</div>
      </section>
      <div className="grid-main">
        <section className="card">
          <h2>Latest activity</h2>
          <ul className="timeline small">{(activity || []).map(x => <li key={x.id}><b>{x.actor}</b> {x.action.toLowerCase()} · <Link href={`/accounts/${x.account_id}`}>{name(x.account_id)}</Link>{x.detail ? <div className="muted">{x.detail}</div> : null}<div className="muted mono">{fmtDateTime(x.created_at)}</div></li>)}</ul>
        </section>
        <section className="card stack">
          <h2>Call practice</h2>
          <div><span className="score-big" style={{ fontSize: 40 }}>{avg ?? "—"}</span> <span className="muted small">average Call Readiness, {scored.length} scored call{scored.length === 1 ? "" : "s"}</span></div>
          <ul className="list small">{scored.slice(0, 8).map((c, i) => <li key={i}>{c.rep} · {name(c.account_id)}: <b>{c.score.total}</b> <span className="muted">({fmtDate(c.created_at)})</span></li>)}</ul>
        </section>
      </div>
    </Shell>
  );
}
