import Link from "next/link";
import Shell from "../components/Shell";
import SetupNeeded from "../components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, trainingData } from "@/lib/data";
import { RUBRIC } from "@/lib/score";
import { fmtDate } from "../components/api";

export const dynamic = "force-dynamic";

export default async function Training() {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/training"><SetupNeeded status={status} /></Shell>;
  const t = await trainingData();
  const mine = t.rows.filter(r => r.rep === user?.name);
  const avgMine = mine.length ? Math.round(mine.reduce((s, r) => s + r.score.total, 0) / mine.length) : null;
  const weakest = [...t.byItem].sort((a, b) => a.pct - b.pct)[0];
  return (
    <Shell user={user} active="/training">
      <div className="row spread">
        <div><div className="eyebrow">Training</div><h1>Mock call results</h1></div>
        {t.isSample && <span className="sample-badge">Includes sample practice calls</span>}
      </div>
      <div className="tiles">
        <div className="tile"><span className="l">Practice calls scored</span><span className="v">{t.rows.length}</span><span className="s">{mine.length} by you</span></div>
        <div className="tile"><span className="l">Your average</span><span className="v">{avgMine ?? "—"}</span><span className="s">80+ = ready for the real call</span></div>
        <div className="tile"><span className="l">Team's weakest move</span><span className="v">{weakest?.part}</span><span className="s">{weakest?.label}: {weakest?.pct}% of points earned</span></div>
      </div>
      <div className="grid-main">
        <section className="card">
          <h2>All practice calls</h2>
          <div className="table-wrap"><table><thead><tr><th>Date</th><th>Rep</th><th>Prospect</th><th>Score</th>{RUBRIC.map(r => <th key={r.id} title={r.label}>{r.part}</th>)}<th></th></tr></thead><tbody>
            {t.rows.map(r => <tr key={r.id}>
              <td className="mono small">{fmtDate(r.created_at)}</td>
              <td>{r.rep}{r.is_sample && <span className="sample-badge" style={{ marginLeft: 6 }}>sample</span>}</td>
              <td>{r.contact ? <Link href={`/accounts/${r.account_id}/contacts/${r.contact_id}`}>{r.contact.name || r.contact.title}</Link> : "—"}<div className="small muted">{r.account?.name}</div></td>
              <td><span className={`chip ${r.score.total >= 80 ? "green" : r.score.total >= 60 ? "yellow" : "red"}`}>{r.score.total}</span></td>
              {RUBRIC.map(x => { const it = r.score.items.find(i => i.id === x.id); return <td key={x.id} className="mono small" title={`${x.label}: ${it?.earned}/${x.points}`} style={{ color: it?.status === "hit" ? "var(--ok)" : it?.status === "partial" ? "var(--warn)" : "var(--err)" }}>{it?.status === "hit" ? "✓" : it?.status === "partial" ? "½" : "✕"}</td>; })}
              <td>{r.contact && <Link className="small" href={`/accounts/${r.account_id}/contacts/${r.contact_id}/mock`}>Practice again</Link>}</td>
            </tr>)}
          </tbody></table></div>
          <p className="small muted">✓ hit · ½ partial · ✕ missed. Columns follow the Call Readiness rubric: C Connect, R Reason, Q “I know” question, Q follow-on depth, V Value, A Ask.</p>
        </section>
        <aside className="stack" style={{ gap: 16 }}>
          <section className="card stack">
            <h2>Team by move</h2>
            {t.byItem.map(i => <div key={i.id} className="stack" style={{ gap: 4 }}><div className="row spread small"><span><b>{i.part}</b> {i.label}</span><span className="mono">{i.pct}%</span></div><div className="meter" aria-hidden><span style={{ width: `${i.pct}%`, background: i.pct >= 75 ? "var(--ok)" : i.pct >= 50 ? "var(--warn)" : "var(--err)" }} /></div></div>)}
          </section>
          <section className="card">
            <h2>By rep</h2>
            <table><thead><tr><th>Rep</th><th>Calls</th><th>Avg</th><th>Best</th></tr></thead><tbody>{t.reps.map(r => <tr key={r.rep}><td>{r.rep}</td><td className="mono">{r.calls}</td><td className="mono">{r.avg}</td><td className="mono">{r.best}</td></tr>)}</tbody></table>
          </section>
          <section className="card small">
            <h2>Coaching tip</h2>
            <p style={{ margin: 0 }}>{weakest?.id === "ladder" ? "Most reps stop after the first answer. Pick one topic and ask three follow-ups in a row before you move to value." : weakest?.id === "ask" ? "End with a yes/no question that has times in it: “Would Tuesday at 10 or Thursday at 2 work?”" : weakest?.id === "iknow" ? "Open discovery with “I know ___. What I don't know is ___.” It proves you did the homework." : "Practice the weakest move on your next mock call, then compare scores here."}</p>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
