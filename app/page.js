import Shell from "./components/Shell";
import SetupNeeded from "./components/SetupNeeded";
import Search from "./components/Search";
import { getUser } from "@/lib/session";
import { ready, listAccountsFull } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/"><SetupNeeded status={status} /></Shell>;
  const accounts = await listAccountsFull();
  const slim = accounts.map(a => ({
    id: a.id, name: a.name, segment: a.segment, hq: a.hq, stage: a.stage,
    sharpest: a.brief?.sharpest?.text || "", level: a.assessment.level, label: a.assessment.label, reason: a.assessment.reasons[0]?.text || "",
    next: a.next[0] || "", lastTouched: a.last_touched_at,
    contacts: a.contacts.map(c => ({ id: c.id, name: c.name, title: c.title, role_type: c.role_type })),
  }));
  const red = slim.filter(a => a.level === "red").length, yellow = slim.filter(a => a.level === "yellow").length;
  return (
    <Shell user={user} active="/">
      <div className="row spread">
        <div>
          <div className="eyebrow">Prospect search</div>
          <h1>Find a prospect, open the brief, make the call.</h1>
        </div>
        <div className="row small">
          <span className="chip red">{red} act now</span>
          <span className="chip yellow">{yellow} this week</span>
          <span className="chip green">{slim.length - red - yellow} on track</span>
        </div>
      </div>
      <Search accounts={slim} />
    </Shell>
  );
}
