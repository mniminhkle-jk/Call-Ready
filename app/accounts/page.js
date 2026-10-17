import Link from "next/link";
import Shell from "../components/Shell";
import SetupNeeded from "../components/SetupNeeded";
import Search from "../components/Search";
import { getUser } from "@/lib/session";
import { ready, loadAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Accounts() {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/accounts"><SetupNeeded status={status} /></Shell>;
  const { accounts } = await loadAll();
  const slim = accounts.map(a => ({
    id: a.id, name: a.name, segment: a.segment, hq: a.hq, stage: a.stage, overview: a.brief?.overview || "",
    level: a.assessment.level, label: a.assessment.label, reason: a.assessment.reasons[0]?.text || "",
    contacts: a.contacts.map(c => ({ id: c.id, name: c.name, title: c.title, role_type: c.role_type, location: c.location, status: c.cs.label, bestScore: c.bestScore })),
  }));
  return (
    <Shell user={user} active="/accounts">
      <div className="row spread">
        <div><div className="eyebrow">Accounts</div><h1>Find a company or a person</h1></div>
        <Link className="btn" href="/new">+ Add account</Link>
      </div>
      <Search accounts={slim} />
    </Shell>
  );
}
