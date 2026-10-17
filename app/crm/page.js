import Shell from "../components/Shell";
import { getUser } from "@/lib/session";
import { FIELD_MAP, STAGE_MAP, crmStatus } from "@/lib/crm";
import CrmTools from "../components/CrmTools";

export const dynamic = "force-dynamic";

export default async function Crm() {
  const user = await getUser();
  const status = crmStatus();
  return (
    <Shell user={user} active="/crm">
      <div className="stack" style={{ gap: 4 }}>
        <div className="eyebrow">CRM sync</div>
        <h1>Salesforce and HubSpot</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 760 }}>Call Ready keeps a Salesforce ID and a HubSpot ID on every company, person, deal and note. Export in each CRM's import format, import their exports, or connect an API token to push and pull automatically. Imports match on CRM ID, then email or name, and never delete records.</p>
      </div>
      <CrmTools status={status} />
      <section className="card">
        <h2>Field mapping</h2>
        {Object.entries(FIELD_MAP).map(([obj, m]) => <div key={obj} className="stack" style={{ marginBottom: 16 }}>
          <h3>{obj[0].toUpperCase() + obj.slice(1)} → Salesforce {m.salesforce} · HubSpot {m.hubspot}</h3>
          <div className="table-wrap"><table><thead><tr><th>Call Ready</th><th>Salesforce</th><th>HubSpot</th></tr></thead><tbody>{m.fields.map(([a, b, c]) => <tr key={a}><td className="mono small">{a}</td><td className="mono small">{b}</td><td className="mono small">{c}</td></tr>)}</tbody></table></div>
        </div>)}
        <p className="small muted">Fields ending in __c are custom fields to create in Salesforce (Call_Ready_Id__c should be an External ID). HubSpot custom properties: callready_id, callready_stage, callready_sharpest_signal, gross_margin, loads, linkedin_url.</p>
      </section>
      <section className="card">
        <h2>Stage mapping</h2>
        <div className="table-wrap"><table><thead><tr><th>Call Ready stage</th><th>Salesforce StageName</th><th>HubSpot dealstage</th></tr></thead><tbody>{Object.keys(STAGE_MAP.salesforce).map(s => <tr key={s}><td>{s}</td><td className="mono small">{STAGE_MAP.salesforce[s]}</td><td className="mono small">{STAGE_MAP.hubspot[s]}</td></tr>)}</tbody></table></div>
      </section>
    </Shell>
  );
}
