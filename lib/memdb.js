// In-memory stand-in for the Supabase client (DEMO_MODE=1). Supports the query shapes this app uses.
import { randomUUID } from "crypto";

const g = globalThis;
g.__crMem = g.__crMem || { accounts: [], contacts: [], notes: [], signals: [], activity: [], brief_history: [], mock_calls: [], settings: [], reps: [], deals: [], seq: 1 };
const store = g.__crMem;
const UNIQUE = { signals: ["account_id", "url"], notes: ["granola_id"], mock_calls: ["call_id"], accounts: ["id"], settings: ["key"], reps: ["id"] };

function withDefaults(table, row) {
  const now = new Date().toISOString();
  const r = { ...row };
  if (["activity", "brief_history"].includes(table)) r.id = r.id ?? store.seq++;
  else if (!["accounts", "settings", "reps"].includes(table)) r.id = r.id ?? randomUUID();
  r.created_at = r.created_at ?? now;
  if (table === "accounts") { r.updated_at = r.updated_at ?? now; r.stage = r.stage ?? "Research"; r.brief = r.brief ?? {}; }
  if (table === "contacts") { r.hooks = r.hooks ?? []; r.contact_source = r.contact_source ?? "rep"; r.brief = r.brief ?? {}; r.phones = r.phones ?? []; r.career = r.career ?? []; }
  if (table === "deals") { r.status = r.status ?? "open"; r.margin = r.margin ?? 0; r.revenue = r.revenue ?? 0; r.loads = r.loads ?? 0; r.is_sample = r.is_sample ?? false; }
  if (table === "accounts") r.phones = r.phones ?? [];
  if (table === "activity") r.source = r.source ?? "call_ready";
  if (table === "signals") { r.status = r.status ?? "new"; r.source = r.source ?? "exa"; }
  if (table === "mock_calls") { r.status = r.status ?? "registered"; r.cost_cents = r.cost_cents ?? 0; r.is_sample = r.is_sample ?? false; }
  return r;
}
const sameKey = (table, a, b) => { const k = UNIQUE[table]; return k && k.every(f => a[f] != null && a[f] === b[f]); };

class Q {
  constructor(table) { this.t = table; this.op = "select"; this.filters = []; this.ord = []; }
  select(cols, opts = {}) { if (this.op === "select") { this.head = opts.head; this.countMode = opts.count; } else this.returning = true; return this; }
  insert(rows) { this.op = "insert"; this.payload = rows; return this; }
  upsert(rows, opts = {}) { this.op = "upsert"; this.payload = rows; this.ignore = opts.ignoreDuplicates; return this; }
  update(obj) { this.op = "update"; this.payload = obj; return this; }
  delete() { this.op = "delete"; return this; }
  eq(c, v) { this.filters.push(r => r[c] === v); return this; }
  in(c, vs) { this.filters.push(r => vs.includes(r[c])); return this; }
  gte(c, v) { this.filters.push(r => r[c] >= v); return this; }
  is(c, v) { this.filters.push(r => (r[c] ?? null) === v); return this; }
  order(c, o = {}) { this.ord.push([c, o.ascending !== false]); return this; }
  limit(n) { this.lim = n; return this; }
  maybeSingle() { this.one = "maybe"; return this; }
  single() { this.one = "single"; return this; }
  then(res, rej) { try { res(this.run()); } catch (e) { rej ? rej(e) : res({ data: null, error: { message: e.message } }); } }
  run() {
    const tbl = store[this.t];
    if (!tbl) return { data: null, error: { message: `relation "${this.t}" does not exist` } };
    const match = r => this.filters.every(f => f(r));
    let out = [];
    if (this.op === "insert" || this.op === "upsert") {
      for (const raw of [].concat(this.payload)) {
        const row = withDefaults(this.t, raw);
        const i = tbl.findIndex(x => sameKey(this.t, x, row));
        if (i >= 0) {
          if (this.op === "insert") return { data: null, error: { message: "duplicate key value violates unique constraint" } };
          if (this.ignore) continue;
          tbl[i] = { ...tbl[i], ...raw }; out.push(tbl[i]);
        } else { tbl.push(row); out.push(row); }
      }
    } else if (this.op === "update") {
      for (const r of tbl) if (match(r)) { Object.assign(r, this.payload); out.push(r); }
    } else if (this.op === "delete") {
      store[this.t] = tbl.filter(r => !match(r));
    } else {
      out = tbl.filter(match);
      for (const [c, asc] of [...this.ord].reverse()) out = [...out].sort((a, b) => { const x = a[c], y = b[c]; if (x == null) return 1; if (y == null) return -1; return (x > y ? 1 : x < y ? -1 : 0) * (asc ? 1 : -1); });
      if (this.lim) out = out.slice(0, this.lim);
      if (this.head) return { data: null, count: out.length, error: null };
    }
    const data = JSON.parse(JSON.stringify(out));
    if (this.one) {
      if (this.one === "single" && data.length !== 1) return { data: null, error: { message: "Expected one row" } };
      return { data: data[0] ?? null, error: null };
    }
    return { data: this.op === "select" || this.returning ? data : null, error: null, count: this.countMode ? data.length : undefined };
  }
}
export function memClient() { return { from: t => new Q(t) }; }
