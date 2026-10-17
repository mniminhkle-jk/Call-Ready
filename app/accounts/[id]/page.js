import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/app/components/Shell";
import SetupNeeded from "@/app/components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, accountBundle } from "@/lib/data";
import { STALE_RULES } from "@/lib/rules";
import { fmtDate, fmtDateTime } from "@/app/components/api";
import { StageSelect, MarkReviewed, SignalsPanel, BriefEditor, AddContact } from "@/app/components/AccountActions";
import NotesPanel from "@/app/components/NotesPanel";

export const dynamic = "force-dynamic";

const SEC = [["ships", "What they ship"], ["where", "Where"], ["when", "How often / when"], ["who", "Who moves it today"]];

export default async function AccountPage({ params }) {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user}><SetupNeeded status={status} /></Shell>;
  const bundle = await accountBundle(params.id);
  if (!bundle) notFound();
  const { account: a, contacts, signals, notes, activity, history, calls, assessment, next } = bundle;
  const b = a.brief || {};
  const src = n => b.sources?.find(s => s.n === n);
  const Src = ({ n }) => { const s = src(n); return s ? <a className="src" href={s.url} target="_blank" rel="noreferrer" title={s.title}>[{n}]</a> : null; };
  const Line = ({ l }) => <><span>{l.text}</span>{" "}{l.tag === "verified" ? <span className="tag v">✓ verified</span> : <span className="tag i">? inferred</span>}{" "}{l.src ? <Src n={l.src} /> : null}</>;

  return (
    <Shell user={user}>
      <div className="row spread" style={{ alignItems: "flex-start" }}>
        <div className="stack" style={{ gap: 6, maxWidth: 760 }}>
          <div className="eyebrow">{[a.segment, a.hq, a.ticker].filter(Boolean).join(" · ")}</div>
          <h1>{a.name}</h1>
          {b.oneLiner && <p style={{ margin: 0 }}>{b.oneLiner}</p>}
          <div className="row small muted" style={{ gap: 14 }}>
            <span>Brief reviewed {a.refreshed_at ? fmtDate(a.refreshed_at) : "never"}{assessment.briefAge != null && ` (${assessment.briefAge} days ago)`}</span>
            <span>Last touch: {a.last_touched_at ? fmtDate(a.last_touched_at) : "none yet"}</span>
            {a.website && <a href={a.website} target="_blank" rel="noreferrer">Website</a>}
          </div>
        </div>
        <div className="stack" style={{ alignItems: "flex-end", gap: 10 }}>
          <StageSelect id={a.id} stage={a.stage} />
          <div className="row">
            <a className="btn" href={`/api/accounts/${a.id}/brief?format=docx`}>Download brief (.docx)</a>
            <a className="btn secondary" href={`/api/accounts/${a.id}/brief?format=md`}>Markdown</a>
          </div>
        </div>
      </div>

      <div className="grid-main">
        <div className="stack" style={{ gap: 16 }}>
          {b.sharpest && <section className="sharpest">
            <div className="eyebrow">Sharpest Signal</div>
            <p style={{ fontSize: 16.5, fontWeight: 500 }}>{b.sharpest.text} {(b.sharpest.src || []).map(n => <Src key={n} n={n} />)}</p>
            <p className="small"><b>Why it gets the call:</b> {b.sharpest.why}</p>
          </section>}

          <section className="card">
            <div className="card-head"><h2>Freight profile</h2><span className="small muted">Every <span className="tag i">? inferred</span> line is a question to ask, not a fact to state.</span></div>
            <ul className="lines">
              {SEC.flatMap(([k, label]) => (b.freight?.[k] || []).map((l, i) => <li key={k + i}><span className="k">{i === 0 ? label : ""}</span><span><Line l={l} /></span></li>))}
            </ul>
          </section>

          <section className="card">
            <h2>Company now</h2>
            <ul className="list">{(b.company || []).map((l, i) => <li key={i}><Line l={l} /></li>)}</ul>
          </section>

          <section className="card stack">
            <h2>Openers (CRVA, tied to the signals)</h2>
            {(b.openers || []).map((o, i) => <div key={i} className="quote"><span className="pill">{o.driver}</span> “{o.text}” {(o.src || []).map(n => <Src key={n} n={n} />)}</div>)}
          </section>

          <section className="card stack">
            <h2>Discovery questions</h2>
            <p className="small muted" style={{ margin: 0 }}>Built from the inferred lines: “I know ___. What I don't know is ___.” Then follow on three levels deep without changing topic.</p>
            {(b.questions || []).map((q, i) => <div key={i} className="quote">
              <div><b>{q.know}</b> {q.dontKnow}</div>
              <ol className="small muted" style={{ margin: "6px 0 0", paddingLeft: 18 }}>{q.ladder.map((x, j) => <li key={j}>{x}</li>)}</ol>
            </div>)}
          </section>

          {b.talkTrack && <section className="card">
            <h2>Talk track</h2>
            <div className="stack" style={{ gap: 0 }}>
              {[["C", "Connect", b.talkTrack.C], ["R", "Reason", b.talkTrack.R], ["V", "Value", `GET: ${b.talkTrack.V.GET} · PAIN: ${b.talkTrack.V.PAIN} · RISK: ${b.talkTrack.V.RISK}`], ["A", "Ask", b.talkTrack.A]].map(([p, l, t]) =>
                <div key={p} className="draft-line"><span className="p">{p}</span><div><div className="small muted">{l}</div>{t}</div></div>)}
            </div>
          </section>}

          <NotesPanel accountId={a.id} contacts={contacts.map(c => ({ id: c.id, label: c.name ? `${c.name}, ${c.title}` : c.title }))} notes={notes} stage={a.stage} />

          <BriefEditor id={a.id} brief={b} />

          <section className="card">
            <h2>Sources</h2>
            <ol className="small" style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>
              {(b.sources || []).map(s => <li key={s.n} value={s.n}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> <span className="muted">({s.date})</span></li>)}
            </ol>
          </section>
        </div>

        <aside className="stack" style={{ gap: 16 }}>
          <section className="card stack">
            <div className="card-head" style={{ marginBottom: 0 }}><h2>Criticality</h2><span className={`chip ${assessment.level}`}>{assessment.label}</span></div>
            <ul className="reasons">{assessment.reasons.length ? assessment.reasons.map((r, i) => <li key={i}><b>{r.rule}</b>{r.text}</li>) : <li>Nothing flagged.</li>}</ul>
            <details className="small muted"><summary>Rules</summary>
              <p>Time: brief over {STALE_RULES.briefYellowDays} days = yellow, over {STALE_RULES.briefRedDays} = red. Event: unreviewed freight signal from the Exa watch in the last {STALE_RULES.freshSignalDays} days. Activity: no touch in {STALE_RULES.contactGapDays} days ({STALE_RULES.activeStageGapDays} on active deals), or overdue next steps.</p>
            </details>
            <MarkReviewed id={a.id} />
          </section>

          <section className="card">
            <h2>Recommended next steps</h2>
            <ol className="list">{next.map((n, i) => <li key={i}>{n}</li>)}</ol>
          </section>

          <section className="card stack">
            <h2>People</h2>
            {contacts.map(c => <Link key={c.id} href={`/accounts/${a.id}/contacts/${c.id}`} className="result" style={{ padding: "10px 12px", gridTemplateColumns: "minmax(0,1fr)" }}>
              <div><div className="title">{c.name || <span className="muted">Name: add from CRM</span>}</div><div className="small muted">{c.title}</div></div>
            </Link>)}
            <AddContact accountId={a.id} />
          </section>

          <SignalsPanel id={a.id} signals={signals} checkedAt={a.signals_checked_at} />

          {b.research && <section className="card stack small">
            <h2>Research log</h2>
            <div>Agent research: <b className="mono">{b.research.agentMinutes} min</b> · human review: <b className="mono">{b.research.reviewMinutes} min</b></div>
            <div className="muted">Where the agent came up short:</div>
            <ul className="list">{b.research.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
          </section>}

          <section className="card stack small">
            <h2>Activity</h2>
            <ul className="timeline">{activity.map(x => <li key={x.id}><b>{x.actor}</b> {x.action.toLowerCase()}{x.detail ? `: ${x.detail}` : ""}<div className="muted">{fmtDateTime(x.created_at)}</div></li>)}</ul>
            {calls.length > 0 && <><div className="muted">Mock calls</div><ul className="list">{calls.map(c => <li key={c.id}>{c.goal}: {c.score?.total != null ? <b>{c.score.total}/100</b> : c.status} <span className="muted">({fmtDate(c.created_at)})</span></li>)}</ul></>}
            <div className="muted">Brief versions: {history.length} saved{history[0] ? `, latest by ${history[0].saved_by} on ${fmtDate(history[0].created_at)}` : ""}.</div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
