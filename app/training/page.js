import Link from "next/link";
import Shell from "../components/Shell";
import SetupNeeded from "../components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, trainingData, hubData } from "@/lib/data";
import { RUBRIC } from "@/lib/score";
import { fmtDate } from "../components/api";

export const dynamic = "force-dynamic";

export default async function Training() {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/training"><SetupNeeded status={status} /></Shell>;
  const [t, hub] = await Promise.all([trainingData(), hubData()]);
  const mine = t.rows.filter(r => r.rep === user?.name);
  const avgMine = mine.length ? Math.round(mine.reduce((s, r) => s + r.score.total, 0) / mine.length) : null;
  const byItem = rows => RUBRIC.map(x => { const v = rows.map(r => r.score.items.find(i => i.id === x.id)).filter(Boolean); return { id: x.id, part: x.part, label: x.label, pct: v.length ? Math.round((v.reduce((s, i) => s + i.earned / i.points, 0) / v.length) * 100) : 0 }; });
  const myMoves = byItem(mine);
  const myWeakest = mine.length ? [...myMoves].sort((a, b) => a.pct - b.pct)[0] : null;
  const teamWeakest = [...t.byItem].sort((a, b) => a.pct - b.pct)[0];
  const next = hub.actions.practice;
  const tipFor = id => id === "ladder" ? "Pick one topic and ask three follow-ups in a row before you move to value." : id === "ask" ? "End with a yes/no question that has times in it: “Would Tuesday at 10 or Thursday at 2 work?”" : id === "iknow" ? "Open discovery with “I know ___. What I don't know is ___.” It proves you did the homework." : id === "value" ? "Name one concrete number: cost per load, dwell hours or on-time %." : id === "reason" ? "Say “I'm calling because…” in your first two turns." : "Thank them and mention one real signal about their company in your first two turns.";
  const Mark = ({ it, x }) => <td className="mono small" title={`${x.label}: ${it?.earned}/${x.points}`} style={{ color: it?.status === "hit" ? "var(--ok)" : it?.status === "partial" ? "var(--warn)" : "var(--err)" }}><span aria-hidden="true">{it?.status === "hit" ? "✓" : it?.status === "partial" ? "½" : "✕"}</span><span className="sr">{x.label}: {it?.status}</span></td>;
  const Table = ({ rows, showRep }) => <div className="table-wrap"><table><thead><tr><th>Date</th>{showRep && <th>Rep</th>}<th>Prospect</th><th>Score</th>{RUBRIC.map(r => <th key={r.id} title={r.label}>{r.part}</th>)}<th></th></tr></thead><tbody>
    {rows.map(r => <tr key={r.id}>
      <td className="mono small">{fmtDate(r.created_at)}</td>
      {showRep && <td>{r.rep}</td>}
      <td>{r.contact ? <Link href={`/accounts/${r.account_id}/contacts/${r.contact_id}`}>{r.contact.name || r.contact.title}</Link> : "—"}<div className="small muted">{r.account?.name}</div></td>
      <td><span className={`chip ${r.score.total >= 80 ? "green" : r.score.total >= 60 ? "yellow" : "red"}`}>{r.score.total}</span></td>
      {RUBRIC.map(x => <Mark key={x.id} x={x} it={r.score.items.find(i => i.id === x.id)} />)}
      <td>{r.contact && <Link className="small" href={`/accounts/${r.account_id}/contacts/${r.contact_id}/mock`}>Practice again</Link>}</td>
    </tr>)}
  </tbody></table></div>;
  return (
    <Shell user={user} active="/training">
      <div><div className="eyebrow">Training</div><h1>Your practice</h1></div>
      <div className="tiles">
        <div className="tile"><span className="l">Your average</span><span className="v">{avgMine ?? "—"}</span><span className="s">{mine.length ? `${mine.length} practice call${mine.length === 1 ? "" : "s"} · 80+ = ready` : "No practice calls yet"}</span></div>
        <div className="tile"><span className="l">Your weakest move</span><span className="v">{myWeakest ? myWeakest.part : "—"}</span><span className="s">{myWeakest ? `${myWeakest.label}: ${myWeakest.pct}% of points` : "Shows after your first call"}</span></div>
        <a href="#next" className="tile" style={{ textDecoration: "none", color: "inherit" }}><span className="l">Practice next</span><span className="v">{next.length}</span><span className="s">contacts under 80 or not practiced</span></a>
      </div>
      <div className="grid-main">
        <div className="stack" style={{ gap: 16 }}>
          <section className="card" id="next" aria-labelledby="h-next">
            <h2 id="h-next">Practice next<span className="count">{next.length}</span></h2>
            {next.length ? <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{next.slice(0, 5).map((x, i) => <li key={i} className="action">
              <div style={{ minWidth: 0 }}><div className="who-line clamp1"><Link href={`/accounts/${x.account.id}/contacts/${x.contact.id}`}>{x.contact.name}</Link><span className="muted" style={{ fontWeight: 400 }}> · {x.account.name}</span></div><div className="why clamp1">{x.why}</div></div>
              <Link className="btn secondary" href={`/accounts/${x.account.id}/contacts/${x.contact.id}/mock`}>Practice</Link>
            </li>)}</ul> : <p className="muted small" style={{ margin: 0 }}>You've scored 80+ with everyone on your list.</p>}
          </section>
          <section className="card" aria-labelledby="h-mine">
            <h2 id="h-mine">Your practice calls</h2>
            {mine.length ? <Table rows={mine} /> : <p className="muted small" style={{ margin: 0 }}>No practice calls yet. Start one from any contact.</p>}
            <p className="small muted" style={{ marginBottom: 0 }}>✓ hit · ½ partial · ✕ missed. C Connect, R Reason, Q “I know” question, Q follow-on depth, V Value, A Ask.</p>
          </section>
          <details className="card more" style={{ marginTop: 0 }}>
            <summary>Team practice calls ({t.rows.length})</summary>
            <div style={{ marginTop: 10 }}><Table rows={t.rows} showRep /></div>
          </details>
        </div>
        <aside className="stack" style={{ gap: 16 }}>
          {myWeakest && <section className="card small stack">
            <h2>Work on: {myWeakest.label}</h2>
            <p style={{ margin: 0 }}>{tipFor(myWeakest.id)}</p>
          </section>}
          <section className="card stack">
            <h2>Your moves</h2>
            {(mine.length ? myMoves : t.byItem).map(i => <div key={i.id} className="stack" style={{ gap: 4 }}><div className="row spread small"><span><b>{i.part}</b> {i.label}</span><span className="mono">{i.pct}%</span></div><div className="meter" aria-hidden><span style={{ width: `${i.pct}%`, background: i.pct >= 75 ? "var(--ok)" : i.pct >= 50 ? "var(--warn)" : "var(--err)" }} /></div></div>)}
          </section>
          <details className="card more" style={{ marginTop: 0 }}>
            <summary>How the team is doing</summary>
            <div className="stack small" style={{ marginTop: 10 }}>
              <div>Team's weakest move: <b>{teamWeakest?.part} {teamWeakest?.label}</b> ({teamWeakest?.pct}%)</div>
              <table><thead><tr><th>Rep</th><th>Calls</th><th>Avg</th><th>Best</th></tr></thead><tbody>{t.reps.map(r => <tr key={r.rep}><td>{r.rep === user?.name ? <b>{r.rep} (you)</b> : r.rep}</td><td className="mono">{r.calls}</td><td className="mono">{r.avg}</td><td className="mono">{r.best}</td></tr>)}</tbody></table>
            </div>
          </details>
        </aside>
      </div>
    </Shell>
  );
}
