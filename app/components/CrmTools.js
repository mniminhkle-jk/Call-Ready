"use client";
import { useState } from "react";
import { api } from "./api";

const OBJECTS = [["accounts", "Companies / Accounts"], ["contacts", "Contacts"], ["deals", "Deals / Opportunities"], ["notes", "Call notes (PRN)"]];
const SYS = { salesforce: "Salesforce", hubspot: "HubSpot" };

export default function CrmTools({ status }) {
  const [sys, setSys] = useState("salesforce");
  const [obj, setObj] = useState("contacts");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function onFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true); setMsg("");
    try { const csv = await file.text(); const r = await api("/api/crm/import", "POST", { system: sys, object: obj, csv }); setMsg(`Imported from ${SYS[sys]}: ${r.created} created, ${r.updated} updated, ${r.skipped} skipped.`); }
    catch (err) { setMsg(err.message); }
    setBusy(false); e.target.value = "";
  }
  async function sync(system, direction) {
    setBusy(true); setMsg("");
    try { const r = await api("/api/crm/sync", "POST", { system, direction }); setMsg(direction === "pull" ? `Pulled from ${SYS[system]}: ${r.created} created, ${r.updated} updated.` : `Pushed ${r.pushed} records to ${SYS[system]}.`); }
    catch (err) { setMsg(err.message); }
    setBusy(false);
  }
  return (
    <>
      {msg && <div className="notice small" role="status">{msg}</div>}
      <div className="grid-main" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}>
        {["salesforce", "hubspot"].map(s => <section key={s} className="card stack">
          <div className="card-head" style={{ marginBottom: 0 }}><h2>{SYS[s]}</h2><span className={`chip ${status[s] ? "green" : "yellow"}`}>{status[s] ? "Connected" : "Not connected"}</span></div>
          {s === "salesforce"
            ? <p className="small muted" style={{ margin: 0 }}>To connect: create a Salesforce Connected App, then add <span className="kbd">SALESFORCE_INSTANCE_URL</span> and <span className="kbd">SALESFORCE_ACCESS_TOKEN</span> to the portal's environment. Create the custom field Call_Ready_Id__c (External ID) on Account and Contact.</p>
            : <p className="small muted" style={{ margin: 0 }}>To connect: create a HubSpot private app with CRM read/write scopes and add <span className="kbd">HUBSPOT_ACCESS_TOKEN</span> to the portal's environment. Create the custom properties listed below.</p>}
          <div className="row">
            <button className="btn" disabled={busy} onClick={() => sync(s, "push")}>Push to {SYS[s]}</button>
            <button className="btn secondary" disabled={busy} onClick={() => sync(s, "pull")}>Pull from {SYS[s]}</button>
          </div>
          <div className="small muted">Until it's connected, use export and import below. They work without any credentials.</div>
        </section>)}
      </div>
      <section className="card stack">
        <h2>Export and import files</h2>
        <div className="field-grid">
          <div><label htmlFor="crm-sys">CRM</label><select id="crm-sys" value={sys} onChange={e => setSys(e.target.value)}><option value="salesforce">Salesforce (Data Import Wizard / Data Loader)</option><option value="hubspot">HubSpot (Import)</option></select></div>
          <div><label htmlFor="crm-obj">Records</label><select id="crm-obj" value={obj} onChange={e => setObj(e.target.value)}>{OBJECTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        </div>
        <div className="row">
          <a className="btn" href={`/api/crm/export?system=${sys}&object=${obj}&format=csv`}>Download {SYS[sys]} CSV</a>
          <a className="btn secondary" href={`/api/crm/export?system=${sys}&object=${obj}&format=json`}>Download JSON</a>
          <label className="btn secondary" style={{ margin: 0, cursor: "pointer" }}>Import {SYS[sys]} CSV<input type="file" accept=".csv,text/csv" onChange={onFile} style={{ display: "none" }} disabled={busy || !["accounts", "contacts"].includes(obj)} /></label>
        </div>
        <p className="small muted" style={{ margin: 0 }}>Exports use each CRM's column names, so the file maps automatically on import. Imports accept Companies/Accounts and Contacts exported from either CRM. Direct lines and emails from your CRM fill in the person profiles.</p>
      </section>
    </>
  );
}
