import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/app/components/Shell";
import SetupNeeded from "@/app/components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, contactBundle } from "@/lib/data";
import { callChecklist } from "@/lib/crva";
import { RUBRIC } from "@/lib/score";
import { GOALS, DIFFICULTY } from "@/lib/persona";
import { BUDGET_CENTS, RETELL_MODEL, MAX_CALL_MS } from "@/lib/integrations";
import MockCall from "@/app/components/MockCall";

export const dynamic = "force-dynamic";

export default async function MockPage({ params }) {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/training"><SetupNeeded status={status} /></Shell>;
  const bundle = await contactBundle(params.id, params.cid);
  if (!bundle) notFound();
  const { account: a, contact: c } = bundle;
  const p = { ...(c.brief?.persona || {}), cares: c.brief?.cares || [] };
  return (
    <Shell user={user} active="/training">
      <div className="row small"><Link href={`/accounts/${a.id}`}>{a.name}</Link><span className="muted">/</span><Link href={`/accounts/${a.id}/contacts/${c.id}`}>{c.name || c.title}</Link><span className="muted">/</span><span>Mock call</span></div>
      <div className="stack" style={{ gap: 4 }}>
        <div className="eyebrow">Mock call · {a.name}</div>
        <h1>Practice the call before you dial</h1>
        <p className="muted" style={{ margin: 0 }}>You'll talk to an AI version of <b>{c.name || c.title}</b> ({c.title.replace(/\s*\(.*\)\s*$/, "")}), built from their brief. Calls stop at {MAX_CALL_MS / 60000} minutes.</p>
      </div>
      <div className="grid-main">
        <MockCall accountId={a.id} contactId={c.id} goals={GOALS} difficulty={Object.entries(DIFFICULTY)} checklist={callChecklist(c)} rubric={RUBRIC.map(({ id, part, label, points, test }) => ({ id, part, label, points, test }))} budgetCap={BUDGET_CENTS} model={RETELL_MODEL} />
        <aside className="stack" style={{ gap: 16 }}>
          <section className="card stack small">
            <h2>The persona</h2>
            <div><b>What they care about:</b> {(p.cares || []).join(", ")}</div>
            <div><b>Pushback to expect:</b><ul className="list">{(p.objections || []).map((o, i) => <li key={i}>“{o}”</li>)}</ul></div>
            <div><b>Value to us:</b> {p.valueToUs}</div>
            <div><b>Value to them:</b> {p.valueToThem}</div>
            <div><b>How to move them forward:</b> earn a discovery meeting by showing you know their freight (Sharpest Signal), then quantify one lane.</div>
          </section>
          <section className="card stack small">
            <h2>Call Readiness rubric</h2>
            <table><tbody>{RUBRIC.map(r => <tr key={r.id}><td><b>{r.part}</b></td><td>{r.label}<div className="muted">{r.test}</div></td><td className="mono">{r.points}</td></tr>)}</tbody></table>
            <div className="muted">80+ ready for the real call · 60–79 almost · under 60 practice again. The score measures what you did on this practice call. It isn't a prediction of the real call.</div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
