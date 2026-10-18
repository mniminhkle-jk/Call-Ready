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
  const onTrack = d.reps.filter(r => r.attainment >= 100 * (17 / 31)).length; // pace: Oct 17 of 31
  return (
    <Shell user={user} active="/dashboards">
      <div className="row spread">
        <div><div className="eyebrow">October 2026 · month to date</div><h1>Are we hitting quota?</h1></div>

      </div>
      <div className="tiles">
        <div className="tile"><span className="l">Team margin vs quota</span><span className="v">{d.team.attainment}%</span><span className="s">{money(d.team.margin)} of {money(d.team.quota)}</span><div className="meter" aria-hidden><span style={{ width: `${Math.min(100, d.team.attainment)}%` }} /></div></div>
        <div className="tile"><span className="l">On pace</span><span className="v">{onTrack} of {d.reps.length}</span><span className="s">reps at or above 55% (day 17 of 31)</span></div>
        <div className="tile"><span className="l">Revenue MTD</span><span className="v">{money(d.team.revenue)}</span><span className="s">{d.team.revenue ? `${Math.round((d.team.margin / d.team.revenue) * 100)}% gross margin` : ""}</span></div>
        <div className="tile"><span className="l">Loads MTD</span><span className="v">{d.team.loads}</span><span className="s">{d.team.loads ? `${money(d.team.margin / d.team.loads)} margin per load` : ""}</span></div>
      </div>
      <div className="grid-main" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
        <section className="card"><h2>Quota attainment by rep</h2><QuotaBars rows={d.reps} /></section>
        <section className="card"><h2>Team gross margin by month</h2><TrendColumns data={d.team.trend} /></section>
      </div>
      <div className="grid-main" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
        <section className="card"><h2>Open pipeline by stage</h2><PipelineBars data={d.pipeline} /></section>
        <section className="card">
          <h2>Rep scorecard</h2>
          <div className="table-wrap"><table><thead><tr><th>Rep</th><th>Attainment</th><th>Pipeline</th><th>Win rate</th><th>Practice avg</th><th>Activity</th></tr></thead><tbody>
            {d.reps.map(r => <tr key={r.id}><td>{r.name}</td><td><span className={`chip ${r.attainment >= 55 ? "green" : r.attainment >= 40 ? "yellow" : "red"}`}>{r.attainment}%</span></td><td className="mono">{money(r.pipeline)}</td><td className="mono">{r.winRate != null ? `${r.winRate}%` : "—"}</td><td className="mono">{r.avgReadiness ?? "—"}</td><td className="small">{r.activity.notes} call{r.activity.notes === 1 ? "" : "s"} · {r.activity.emails} email{r.activity.emails === 1 ? "" : "s"} · {r.activity.mock} practice</td></tr>)}
          </tbody></table></div>
          <details className="more small"><summary>How to read this</summary><p>Green means on pace for 100% by month end, yellow is within reach, red needs a plan. Practice average comes from <Link href="/training">Training</Link>. Figures sync from Salesforce or HubSpot; this prototype shows the portal's own data.</p></details>
        </section>
      </div>
      <section className="card">
        <h2>Open deals</h2>
        <div className="table-wrap"><table><thead><tr><th>Deal</th><th>Owner</th><th>Stage</th><th>Est. margin</th><th>Close</th></tr></thead><tbody>
          {d.deals.filter(x => x.status === "open").map(x => <tr key={x.id}><td>{x.account_id ? <Link href={`/accounts/${x.account_id}`}>{x.name}</Link> : x.name}</td><td>{d.reps.find(r => r.id === x.owner)?.name || x.owner}</td><td>{x.stage}</td><td className="mono">{money(x.margin)}</td><td className="mono small">{x.close_date}</td></tr>)}
        </tbody></table></div>
      </section>
      <ActivityFeed items={d.activity.map(x => ({ ...x, detail: `${x.detail || ""}${x.account_id ? ` · ${d.accounts.find(a => a.id === x.account_id)?.name || ""}` : ""}` }))} title="Team activity" max={10} />
    </Shell>
  );
}
