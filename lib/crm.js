// CRM mapping for Salesforce and HubSpot. Call Ready keeps sf_id / hubspot_id on every record,
// exports in each CRM's import format, imports their exports, and (with credentials) pushes/pulls over their APIs.
import { db, logActivity } from "./db";

export const STAGE_MAP = {
  salesforce: { Research: "Prospecting", Outreach: "Prospecting", Connected: "Qualification", Discovery: "Needs Analysis", "Lane test / Quote": "Proposal/Price Quote", "Active shipper": "Closed Won", "Closed lost": "Closed Lost" },
  hubspot: { Research: "appointmentscheduled", Outreach: "appointmentscheduled", Connected: "qualifiedtobuy", Discovery: "presentationscheduled", "Lane test / Quote": "contractsent", "Active shipper": "closedwon", "Closed lost": "closedlost" },
};
const reverseStage = sys => Object.fromEntries(Object.entries(STAGE_MAP[sys]).reverse().map(([k, v]) => [v.toLowerCase(), k]));
const domain = url => (url || "").replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
const split = name => { const p = (name || "").trim().split(/\s+/); return { first: p.length > 1 ? p.slice(0, -1).join(" ") : "", last: p.length ? p[p.length - 1] : "" }; };
const cityState = hq => { const [city, state] = (hq || "").split(",").map(s => s.trim()); return { city: city || "", state: (state || "").slice(0, 2) }; };
const prnText = p => [`Purpose: ${p.purpose || ""}`, ...Object.entries(p.results || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`), p.contacts ? `New contacts: ${p.contacts}` : "", ...(p.next || []).map(s => `Next: ${s.text}${s.due ? ` (due ${s.due})` : ""}${s.owner ? ` [${s.owner}]` : ""}`)].filter(Boolean).join("\n");

// Field mapping, shown on the CRM page and used by export/import.
export const FIELD_MAP = {
  accounts: { salesforce: "Account", hubspot: "companies", fields: [["name", "Name", "name"], ["website", "Website", "domain"], ["phones[0]", "Phone", "phone"], ["hq city/state", "BillingCity / BillingState", "city / state"], ["segment", "Industry", "industry"], ["brief.overview", "Description", "description"], ["stage", "Call_Ready_Stage__c", "callready_stage"], ["id", "Call_Ready_Id__c", "callready_id"]] },
  contacts: { salesforce: "Contact", hubspot: "contacts", fields: [["name", "FirstName / LastName", "firstname / lastname"], ["title", "Title", "jobtitle"], ["email (CRM)", "Email", "email"], ["phone (CRM)", "Phone", "phone"], ["account", "Account.Name", "company"], ["linkedin_url", "LinkedIn_URL__c", "linkedin_url"], ["brief.sharpest", "Description", "callready_sharpest_signal"], ["id", "Call_Ready_Id__c", "callready_id"]] },
  deals: { salesforce: "Opportunity", hubspot: "deals", fields: [["name", "Name", "dealname"], ["account", "Account.Name", "associated company"], ["stage", "StageName", "dealstage"], ["revenue", "Amount", "amount"], ["margin", "Gross_Margin__c", "gross_margin"], ["loads", "Loads__c", "loads"], ["close_date", "CloseDate", "closedate"], ["owner", "Owner", "hubspot_owner_id"]] },
  notes: { salesforce: "Task (Type = Call)", hubspot: "notes", fields: [["prn.purpose", "Subject", "(first line of body)"], ["PRN text", "Description", "hs_note_body"], ["created_at", "ActivityDate", "hs_timestamp"], ["contact", "WhoId", "associated contact"], ["account", "WhatId", "associated company"]] },
};

export async function exportRows(system, object) {
  const sb = db();
  const [{ data: accounts }, { data: contacts }, { data: deals }, { data: notes }, { data: reps }] = await Promise.all([
    sb.from("accounts").select("*"), sb.from("contacts").select("*"), sb.from("deals").select("*"), sb.from("notes").select("*"), sb.from("reps").select("*"),
  ]);
  const acct = id => (accounts || []).find(a => a.id === id);
  const sf = system === "salesforce";
  if (object === "accounts") return (accounts || []).map(a => { const { city, state } = cityState(a.hq); return sf
    ? { Name: a.name, Website: a.website || "", Phone: a.phones?.[0]?.number || "", BillingCity: city, BillingState: state, Industry: a.segment || "", Description: a.brief?.overview || "", Call_Ready_Stage__c: a.stage, Call_Ready_Id__c: a.id, Id: a.sf_id || "" }
    : { name: a.name, domain: domain(a.website), phone: a.phones?.[0]?.number || "", city, state, industry: a.segment || "", description: a.brief?.overview || "", callready_stage: a.stage, callready_id: a.id, "Record ID": a.hubspot_id || "" }; });
  if (object === "contacts") return (contacts || []).map(c => { const { first, last } = split(c.name); const a = acct(c.account_id); return sf
    ? { FirstName: first, LastName: last || "(unknown)", Title: c.title, Email: c.email || "", Phone: c.phone || "", "Account.Name": a?.name || "", LinkedIn_URL__c: c.linkedin_url || "", LeadSource: "Call Ready", Description: c.brief?.sharpest?.text || "", Call_Ready_Id__c: c.id, Id: c.sf_id || "" }
    : { firstname: first, lastname: last, jobtitle: c.title, email: c.email || "", phone: c.phone || "", company: a?.name || "", linkedin_url: c.linkedin_url || "", callready_sharpest_signal: c.brief?.sharpest?.text || "", callready_id: c.id, "Record ID": c.hubspot_id || "" }; });
  if (object === "deals") return (deals || []).map(d => { const a = acct(d.account_id); const owner = (reps || []).find(r => r.id === d.owner); return sf
    ? { Name: d.name, "Account.Name": a?.name || d.customer_name || "", StageName: d.status === "won" ? "Closed Won" : d.status === "lost" ? "Closed Lost" : STAGE_MAP.salesforce[d.stage] || "Prospecting", Amount: d.revenue, Gross_Margin__c: d.margin, Loads__c: d.loads, CloseDate: d.close_date || "", Owner: owner?.name || d.owner, Sample_Data__c: d.is_sample ? "true" : "false", Id: d.sf_id || "" }
    : { dealname: d.name, company: a?.name || d.customer_name || "", dealstage: d.status === "won" ? "closedwon" : d.status === "lost" ? "closedlost" : STAGE_MAP.hubspot[d.stage] || "appointmentscheduled", pipeline: "default", amount: d.revenue, gross_margin: d.margin, loads: d.loads, closedate: d.close_date || "", owner: owner?.name || d.owner, sample_data: d.is_sample ? "true" : "false", "Record ID": d.hubspot_id || "" }; });
  if (object === "notes") return (notes || []).map(n => { const a = acct(n.account_id); const c = (contacts || []).find(x => x.id === n.contact_id); return sf
    ? { Subject: `Call: ${n.prn?.purpose || ""}`.slice(0, 255), Description: prnText(n.prn || {}), ActivityDate: String(n.created_at).slice(0, 10), Type: "Call", Status: "Completed", "Who (Contact)": c?.name || "", "What (Account)": a?.name || "", Id: n.sf_id || "" }
    : { hs_note_body: prnText(n.prn || {}), hs_timestamp: n.created_at, contact: c?.name || "", company: a?.name || "", "Record ID": n.hubspot_id || "" }; });
  throw new Error("Unknown object. Use accounts, contacts, deals or notes.");
}

export function toCSV(rows) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = v => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [cols.join(","), ...rows.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
}

export function parseCSV(text) {
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const [head, ...body] = rows.filter(r => r.some(c => c.trim()));
  return (body || []).map(r => Object.fromEntries((head || []).map((h, i) => [h.trim(), (r[i] || "").trim()])));
}

// Import a Salesforce or HubSpot export (accounts/companies or contacts). Matches by CRM id, then by name/email; never deletes.
export async function importRows(system, object, rows, actor) {
  const sb = db();
  const get = (r, ...keys) => { for (const k of keys) { const hit = Object.keys(r).find(x => x.toLowerCase() === k.toLowerCase()); if (hit && r[hit]) return r[hit]; } return ""; };
  const idCol = system === "salesforce" ? "sf_id" : "hubspot_id";
  let created = 0, updated = 0, skipped = 0;
  const { data: accounts } = await sb.from("accounts").select("id,name,sf_id,hubspot_id");
  if (object === "accounts") {
    for (const r of rows) {
      const name = get(r, "Name", "Company name", "name", "Account Name"); if (!name) { skipped++; continue; }
      const extId = get(r, "Id", "Account ID", "Record ID", "hs_object_id");
      const match = (accounts || []).find(a => (extId && a[idCol] === extId) || a.name.toLowerCase() === name.toLowerCase());
      const fields = { website: get(r, "Website", "Company Domain Name", "domain") || undefined, segment: get(r, "Industry", "industry") || undefined };
      if (extId) fields[idCol] = extId;
      Object.keys(fields).forEach(k => fields[k] === undefined && delete fields[k]);
      if (match) { await sb.from("accounts").update(fields).eq("id", match.id); updated++; }
      else {
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
        const city = get(r, "BillingCity", "City", "city"), state = get(r, "BillingState", "State/Region", "state");
        await sb.from("accounts").insert({ id, name, hq: [city, state].filter(Boolean).join(", ") || null, phones: get(r, "Phone", "Phone Number") ? [{ label: `Main (from ${system})`, number: get(r, "Phone", "Phone Number"), src: system }] : [], stage: reverseStage(system)[(get(r, "Call_Ready_Stage__c", "callready_stage") || "").toLowerCase()] || "Research", brief: { overview: get(r, "Description", "description"), facts: [], freight: [], locations: [], leadership: [], sources: [] }, ...fields });
        created++;
      }
    }
  } else if (object === "contacts") {
    const { data: contacts } = await sb.from("contacts").select("id,name,email,sf_id,hubspot_id,account_id");
    for (const r of rows) {
      const first = get(r, "FirstName", "First Name", "firstname"), last = get(r, "LastName", "Last Name", "lastname");
      const name = [first, last].filter(Boolean).join(" ") || get(r, "Name", "Full Name");
      const title = get(r, "Title", "Job Title", "jobtitle") || "Title not on file";
      const email = get(r, "Email", "email"); const extId = get(r, "Id", "Contact ID", "Record ID", "hs_object_id");
      const company = get(r, "Account.Name", "Account Name", "Company Name", "company", "Associated Company");
      const acc = (accounts || []).find(a => a.name.toLowerCase() === company.toLowerCase());
      if (!acc || !name) { skipped++; continue; }
      const match = (contacts || []).find(c => (extId && c[idCol] === extId) || (email && c.email?.toLowerCase() === email.toLowerCase()) || (c.account_id === acc.id && c.name?.toLowerCase() === name.toLowerCase()));
      const fields = { email: email || undefined, phone: get(r, "Phone", "Phone Number", "MobilePhone") || undefined, title };
      if (extId) fields[idCol] = extId;
      Object.keys(fields).forEach(k => fields[k] === undefined && delete fields[k]);
      if (match) { await sb.from("contacts").update({ ...fields, contact_source: "crm" }).eq("id", match.id); updated++; }
      else { await sb.from("contacts").insert({ account_id: acc.id, name, ...fields, contact_source: "crm", role_type: /transport|logist/i.test(title) ? "Logistics" : /procure|purchas|sourc/i.test(title) ? "Procurement" : /supply/i.test(title) ? "Supply Chain" : /chief|president|vp|vice/i.test(title) ? "Executive" : "Operations", created_by: `${system} import` }); created++; }
    }
  } else throw new Error("Import supports accounts (companies) and contacts.");
  await logActivity(null, actor, `Imported ${object} from ${system === "salesforce" ? "Salesforce" : "HubSpot"}`, `${created} created, ${updated} updated, ${skipped} skipped`);
  return { created, updated, skipped };
}

// ───────── Live API sync (activates when credentials are set) ─────────
export function crmStatus() {
  return {
    hubspot: !!process.env.HUBSPOT_ACCESS_TOKEN,
    salesforce: !!(process.env.SALESFORCE_INSTANCE_URL && process.env.SALESFORCE_ACCESS_TOKEN),
  };
}

async function hubspot(path, init = {}) {
  const res = await fetch(`https://api.hubapi.com${path}`, { ...init, headers: { authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`, "content-type": "application/json", ...(init.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`HubSpot ${path} failed (${res.status}): ${body.message || ""}`);
  return body;
}
async function salesforce(path, init = {}) {
  const res = await fetch(`${process.env.SALESFORCE_INSTANCE_URL}/services/data/v61.0${path}`, { ...init, headers: { authorization: `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`, "content-type": "application/json", ...(init.headers || {}) } });
  const body = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Salesforce ${path} failed (${res.status}): ${JSON.stringify(body).slice(0, 200)}`);
  return body;
}

// Push accounts and contacts (upsert by Call Ready id). Stores the CRM ids back on our records.
export async function pushToCRM(system, actor) {
  const status = crmStatus();
  if (!status[system]) throw new Error(system === "hubspot" ? "Add HUBSPOT_ACCESS_TOKEN (a HubSpot private app token) to connect HubSpot." : "Add SALESFORCE_INSTANCE_URL and SALESFORCE_ACCESS_TOKEN (connected app) to connect Salesforce.");
  const sb = db();
  const accounts = await exportRows(system, "accounts");
  const contacts = await exportRows(system, "contacts");
  let pushed = 0;
  for (const a of accounts) {
    if (system === "hubspot") {
      const { "Record ID": rid, ...props } = a;
      const r = rid ? await hubspot(`/crm/v3/objects/companies/${rid}`, { method: "PATCH", body: JSON.stringify({ properties: props }) }) : await hubspot("/crm/v3/objects/companies", { method: "POST", body: JSON.stringify({ properties: props }) });
      await sb.from("accounts").update({ hubspot_id: r.id }).eq("id", a.callready_id);
    } else {
      const { Id, Call_Ready_Id__c, ...fields } = a;
      const r = await salesforce(`/sobjects/Account/Call_Ready_Id__c/${encodeURIComponent(Call_Ready_Id__c)}`, { method: "PATCH", body: JSON.stringify(fields) });
      if (r.id) await sb.from("accounts").update({ sf_id: r.id }).eq("id", Call_Ready_Id__c);
    }
    pushed++;
  }
  for (const c of contacts) {
    if (system === "hubspot") {
      const { "Record ID": rid, company, ...props } = c;
      const r = rid ? await hubspot(`/crm/v3/objects/contacts/${rid}`, { method: "PATCH", body: JSON.stringify({ properties: props }) }) : await hubspot("/crm/v3/objects/contacts", { method: "POST", body: JSON.stringify({ properties: props }) });
      await sb.from("contacts").update({ hubspot_id: r.id }).eq("id", c.callready_id);
    } else {
      const { Id, Call_Ready_Id__c, "Account.Name": accountName, ...fields } = c;
      const r = await salesforce(`/sobjects/Contact/Call_Ready_Id__c/${encodeURIComponent(Call_Ready_Id__c)}`, { method: "PATCH", body: JSON.stringify(fields) });
      if (r.id) await sb.from("contacts").update({ sf_id: r.id }).eq("id", Call_Ready_Id__c);
    }
    pushed++;
  }
  await logActivity(null, actor, `Pushed records to ${system === "hubspot" ? "HubSpot" : "Salesforce"}`, `${pushed} records`);
  return { pushed };
}

// Pull contacts updated in the CRM (emails, direct lines) back into Call Ready.
export async function pullFromCRM(system, actor) {
  const status = crmStatus();
  if (!status[system]) throw new Error(`Connect ${system === "hubspot" ? "HubSpot" : "Salesforce"} first (see the setup steps on this page).`);
  let rows = [];
  if (system === "hubspot") {
    const r = await hubspot("/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,jobtitle,email,phone,company");
    rows = (r.results || []).map(x => ({ "Record ID": x.id, ...x.properties }));
  } else {
    const r = await salesforce(`/query?q=${encodeURIComponent("SELECT Id, FirstName, LastName, Title, Email, Phone, Account.Name FROM Contact WHERE LastModifiedDate = LAST_N_DAYS:30 LIMIT 200")}`);
    rows = (r.records || []).map(x => ({ Id: x.Id, FirstName: x.FirstName, LastName: x.LastName, Title: x.Title, Email: x.Email, Phone: x.Phone, "Account.Name": x.Account?.Name || "" }));
  }
  return importRows(system, "contacts", rows, actor);
}
