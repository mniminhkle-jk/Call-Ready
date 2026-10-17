import fs from "fs";
import path from "path";
import CopyButton from "./CopyButton";

export default function SetupNeeded({ status }) {
  let sql = "";
  try { sql = fs.readFileSync(path.join(process.cwd(), "supabase/migrations/20261017000000_init.sql"), "utf8"); } catch {}
  return (
    <div className="card stack">
      <h1>One-time database setup</h1>
      <p>The portal is connected to Supabase, but its tables don't exist yet. Open your Supabase project, go to <b>SQL Editor → New query</b>, paste the script below and click <b>Run</b>. Then reload this page; the three sample accounts load automatically.</p>
      {status?.error && <div className="notice err small">Database said: {status.error}</div>}
      <div className="row"><CopyButton text={sql} label="Copy setup SQL" /></div>
      <pre className="mono small" style={{ maxHeight: 360, overflow: "auto", background: "var(--panel-2)", padding: 12, borderRadius: 6, border: "1px solid var(--line)" }}>{sql}</pre>
    </div>
  );
}
