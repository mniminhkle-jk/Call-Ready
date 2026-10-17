import { db, schemaStatus } from "./db";
import { ensureSeed } from "./seeding";
import { assess, contactStatus, contactNextSteps, hubActions } from "./rules";

export async function ready() {
  const s = await schemaStatus();
  if (!s.ok) return s;
  await ensureSeed();
  return { ok: true };
}

function decorate(accounts, contacts, signals, notes, activity, calls) {
  return accounts.map(a => {
    const s = signals.filter(x => x.account_id === a.id);
    const n = notes.filter(x => x.account_id === a.id);
    const act = activity.filter(x => x.account_id === a.id);
    const cs = contacts.filter(x => x.account_id === a.id).map(c => {
      const st = contactStatus(c, n, act);
      const scores = calls.filter(m => m.contact_id === c.id && m.score?.total != null).map(m => m.score.total);
      return { ...c, cs: st, bestScore: scores.length ? Math.max(...scores) : null, next: contactNextSteps(c, st, a) };
    });
    const assessment = assess(a, s, n);
    return { ...a, contacts: cs, signals: s, notes: n, assessment };
  });
}

export async function loadAll() {
  const sb = db();
  const [{ data: accounts }, { data: contacts }, { data: signals }, { data: notes }, { data: activity }, { data: calls }] = await Promise.all([
    sb.from("accounts").select("*").order("name"),
    sb.from("contacts").select("*").order("created_at"),
    sb.from("signals").select("*"),
    sb.from("notes").select("*").order("created_at", { ascending: false }),
    sb.from("activity").select("*").order("created_at", { ascending: false }).limit(500),
    sb.from("mock_calls").select("id,contact_id,account_id,rep,score,created_at,is_sample,goal,status,duration_s,cost_cents"),
  ]);
  return { accounts: decorate(accounts || [], contacts || [], signals || [], notes || [], activity || [], calls || []), activity: activity || [], calls: calls || [] };
}

export async function hubData() {
  const all = await loadAll();
  return { ...all, actions: hubActions(all.accounts) };
}

export async function accountBundle(id) {
  const sb = db();
  const { data: account } = await sb.from("accounts").select("*").eq("id", id).maybeSingle();
  if (!account) return null;
  const [{ data: contacts }, { data: signals }, { data: notes }, { data: activity }, { data: calls }, { data: deals }] = await Promise.all([
    sb.from("contacts").select("*").eq("account_id", id).order("created_at"),
    sb.from("signals").select("*").eq("account_id", id).order("published_at", { ascending: false, nullsFirst: false }),
    sb.from("notes").select("*").eq("account_id", id).order("created_at", { ascending: false }),
    sb.from("activity").select("*").eq("account_id", id).order("created_at", { ascending: false }).limit(50),
    sb.from("mock_calls").select("id,contact_id,account_id,rep,score,created_at,is_sample,goal,status,duration_s").eq("account_id", id).order("created_at", { ascending: false }),
    sb.from("deals").select("*").eq("account_id", id),
  ]);
  const [a] = decorate([account], contacts || [], signals || [], notes || [], activity || [], calls || []);
  return { account: a, contacts: a.contacts, signals: signals || [], notes: notes || [], activity: activity || [], calls: calls || [], deals: deals || [], assessment: a.assessment };
}

export async function contactBundle(accountId, contactId) {
  const b = await accountBundle(accountId);
  if (!b) return null;
  const contact = b.contacts.find(c => c.id === contactId);
  if (!contact) return null;
  return { ...b, contact, myNotes: b.notes.filter(n => n.contact_id === contactId), myCalls: b.calls.filter(c => c.contact_id === contactId), myActivity: b.activity.filter(x => x.contact_id === contactId) };
}

// ───────── Dashboards ─────────
export async function dashboardData(month = "2026-10") {
  const sb = db();
  const [{ data: reps }, { data: deals }, { data: activity }, { data: calls }, { data: accounts }] = await Promise.all([
    sb.from("reps").select("*"), sb.from("deals").select("*"), sb.from("activity").select("*").order("created_at", { ascending: false }).limit(500),
    sb.from("mock_calls").select("rep,score,created_at,is_sample"), sb.from("accounts").select("id,name,stage"),
  ]);
  const won = (deals || []).filter(d => d.status === "won");
  const inMonth = (d, m) => String(d.close_date || "").startsWith(m);
  const months = ["2026-07", "2026-08", "2026-09", "2026-10"];
  const repRows = (reps || []).map(r => {
    const mtd = won.filter(d => d.owner === r.id && inMonth(d, month));
    const margin = mtd.reduce((s, d) => s + Number(d.margin), 0);
    const revenue = mtd.reduce((s, d) => s + Number(d.revenue), 0);
    const loads = mtd.reduce((s, d) => s + Number(d.loads), 0);
    const open = (deals || []).filter(d => d.owner === r.id && d.status === "open");
    const closed = (deals || []).filter(d => d.owner === r.id && d.status !== "open");
    const winRate = closed.length ? Math.round((closed.filter(d => d.status === "won").length / closed.length) * 100) : null;
    const repCalls = (calls || []).filter(c => c.rep === r.name && c.score?.total != null);
    const acts = (activity || []).filter(a => a.actor === r.name);
    return {
      ...r, margin, revenue, loads, attainment: r.monthly_quota ? Math.round((margin / r.monthly_quota) * 100) : 0,
      pipeline: open.reduce((s, d) => s + Number(d.margin), 0), openDeals: open.length, winRate,
      avgReadiness: repCalls.length ? Math.round(repCalls.reduce((s, c) => s + c.score.total, 0) / repCalls.length) : null,
      activity: { notes: acts.filter(a => /notes|Granola/i.test(a.action)).length, emails: acts.filter(a => /email/i.test(a.action)).length, linkedin: acts.filter(a => /LinkedIn/i.test(a.action)).length, mock: repCalls.length },
      trend: months.map(m => ({ month: m, margin: won.filter(d => d.owner === r.id && inMonth(d, m)).reduce((s, d) => s + Number(d.margin), 0) })),
    };
  });
  const team = {
    quota: repRows.reduce((s, r) => s + Number(r.monthly_quota), 0),
    margin: repRows.reduce((s, r) => s + r.margin, 0),
    revenue: repRows.reduce((s, r) => s + r.revenue, 0),
    loads: repRows.reduce((s, r) => s + r.loads, 0),
    trend: months.map(m => ({ month: m, margin: won.filter(d => inMonth(d, m)).reduce((s, d) => s + Number(d.margin), 0), quota: repRows.reduce((s, r) => s + Number(r.monthly_quota), 0) })),
  };
  team.attainment = team.quota ? Math.round((team.margin / team.quota) * 100) : 0;
  const stages = ["Research", "Outreach", "Connected", "Discovery", "Lane test / Quote"];
  const pipeline = stages.map(s => { const ds = (deals || []).filter(d => d.status === "open" && d.stage === s); return { stage: s, count: ds.length, margin: ds.reduce((x, d) => x + Number(d.margin), 0) }; });
  const isSample = (deals || []).some(d => d.is_sample);
  return { month, reps: repRows.sort((a, b) => b.attainment - a.attainment), team, pipeline, deals: deals || [], activity: activity || [], accounts: accounts || [], isSample };
}

export async function trainingData() {
  const sb = db();
  const [{ data: calls }, { data: contacts }, { data: accounts }] = await Promise.all([
    sb.from("mock_calls").select("*").order("created_at", { ascending: false }),
    sb.from("contacts").select("id,name,title,account_id"),
    sb.from("accounts").select("id,name"),
  ]);
  const rows = (calls || []).filter(c => c.score?.total != null).map(c => ({ ...c, contact: (contacts || []).find(x => x.id === c.contact_id), account: (accounts || []).find(x => x.id === c.account_id) }));
  const items = ["connect", "reason", "iknow", "ladder", "value", "ask"];
  const byItem = items.map(id => {
    const vals = rows.map(r => r.score.items.find(i => i.id === id)).filter(Boolean);
    const label = vals[0]?.label || id;
    const pct = vals.length ? Math.round((vals.reduce((s, v) => s + v.earned / v.points, 0) / vals.length) * 100) : 0;
    return { id, label, part: vals[0]?.part, pct };
  });
  const reps = [...new Set(rows.map(r => r.rep))].map(rep => { const rr = rows.filter(r => r.rep === rep); return { rep, calls: rr.length, avg: Math.round(rr.reduce((s, r) => s + r.score.total, 0) / rr.length), best: Math.max(...rr.map(r => r.score.total)), last: rr[0]?.created_at, sample: rr.every(r => r.is_sample) }; }).sort((a, b) => b.avg - a.avg);
  return { rows, byItem, reps, isSample: rows.some(r => r.is_sample) };
}
