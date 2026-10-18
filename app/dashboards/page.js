import Link from "next/link";
import Shell from "../components/Shell";
import SetupNeeded from "../components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, dashboardData } from "@/lib/data";
import { QuotaBars, TrendColumns, PipelineBars } from "../components/Charts";
import ActivityFeed from "../components/ActivityFeed";

export const dynamic = "force-dynamic";
const money = n => `$${Math.round(n).toLocaleString("en-US")}`;

export default async function Dashboards() {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/dashboards"><SetupNeeded status={status} /></Shell>;
  const d = await dashboardData();
  const day = Math.min(31, new Date().getDate()), pacePct = Math.round(100 * (day / 31));
  const onTrack = d.reps.filter(r => r.attainment >= pacePct).length;
  const me = d.reps.find(r => r.id === user?.username) || d.reps.find(r => r.name === user?.name);
  const myDeals = d.deals.filter(x => x.status === "open" && me && x.owner === me.id);
  const teamDeals = d.deals.filter(x => x.status === "open" && (!me || x.owner !== me.id));
  const gap = me ? Math.max(0, me.monthly_quota - me.margin) : 0;
  const DealTable = ({ rows, owner }) => <div className="table-wrap"><table><thead><tr><th>Deal</th>{owner && <th>Owner</th>}<th>Stage</th><th>Est. margin</th><th>Close</th></tr></thead><tbody>
    {rows.map(x => <tr key={x.id}><td>{x.account_id ? <Link href={`/accounts/${x.account_id}`}>{x.name}</Link> : x.name}</td>{owner && <td>{d.reps.find(r => r.id === x.owner)?.name || x.owner}</td>}<td>{x.stage}</td><td className="mono">{money(x.margin)}</td><td className="mono small">{x.close_date}</td></tr>)}
  </tbody></table></div>;
  return (
    <Shell user={user} active="/dashboards">
      <div><div className="eyebrow">October 2026 · day {day} of 31</div><h1>Am I on pace?</h1></div>
      <div className="tiles">
        <div className="tile"><span className="l">Your quota</span><span className="v">{me ? `${me.attainment}%` : "—"}</span><span className="s">{me ? `${money(me.margin)} of ${money(me.monthly_quota)} · pace is ${pacePct}%` : "No quota on file"}</span><div className="meter" aria-hidden><span style={{ width: `${Math.min(100, me?.attainment || 0)}%` }} /></div></div>
        <div className="tile"><span className="l">Still to close</span><span className="v">{money(gap)}</span><span className="s">margin by Oct 31</span></div>
        <div className="tile"><span className="l">Your pipeline</span><span className="v">{me ? money(me.pipeline) : "—"}</span><span className="s">{myDeals.length} open deal{myDeals.length === 1 ? "" : "s"}{me && gap ? ` · covers ${Math.round((me.pipeline / gap) * 100)}% of the gap` : ""}</span></div>
        <div className="tile"><span className="l">Team</span><span className="v">{d.team.attainment}%</span><span className="s">{onTrack} of {d.reps.length} reps on pace</span></div>
      </div>
      <section className="card">
        <h2>Your open deals<span className="count">{myDeals.length}</span></h2>
        {myDeals.length ? <DealTable rows={myDeals} /> : <p className="muted small" style={{ margin: 0 }}>No open deals. Log a call to move an account forward.</p>}
      </section>
      <div className="grid-main" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
        <section className="card"><h2>Quota attainment by rep</h2><QuotaBars rows={d.reps} /></section>
        <section className="card"><h2>Team gross margin by month</h2><TrendColumns data={d.team.trend} /></section>
      </div>
      <div className="grid-main" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
        <section className="card">
          <h2>Rep scorecard</h2>
          <div className="table-wrap"><table><thead><tr><th>Rep</th><th>Attainment</th><th>Pipeline</th><th>Win rate</th><th>Practice avg</th></tr></thead><tbody>
            {d.reps.map(r => <tr key={r.id} style={me && r.id === me.id ? { background: "var(--panel-2)" } : undefined}><td style={{ fontWeight: me && r.id === me.id ? 700 : 400 }}>{r.name}{me && r.id === me.id ? " (you)" : ""}</td><td><span className={`chip ${r.attainment >= pacePct ? "green" : r.attainment >= pacePct - 15 ? "yellow" : "red"}`}>{r.attainment}%</span></td><td className="mono">{money(r.pipeline)}</td><td className="mono">{r.winRate != null ? `${r.winRate}%` : "—"}</td><td className="mono">{r.avgReadiness ?? "—"}</td></tr>)}
          </tbody></table></div>
          <details className="more small"><summary>How to read this</summary><p>Green is at or above pace ({pacePct}% on day {day}), yellow is within 15 points, red needs a plan. Practice average comes from <Link href="/training">Training</Link>. In production these numbers come from Salesforce or HubSpot.</p></details>
        </section>
        <section className="card"><h2>Open pipeline by stage</h2><PipelineBars data={d.pipeline} /></section>
      </div>
      <details className="card more" style={{ marginTop: 0 }}>
        <summary>Team open deals ({teamDeals.length})</summary>
        <div style={{ marginTop: 10 }}><DealTable rows={teamDeals} owner /></div>
      </details>
      <ActivityFeed items={d.activity.map(x => ({ ...x, detail: `${x.detail || ""}${x.account_id ? ` · ${d.accounts.find(a => a.id === x.account_id)?.name || ""}` : ""}` }))} title="Team activity" max={6} />
    </Shell>
  );
}
