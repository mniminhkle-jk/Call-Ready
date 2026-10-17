// Single-series SVG charts: one hue, recessive grid, direct labels, hover titles, and a table view underneath.
const money = n => `$${Math.round(n).toLocaleString("en-US")}`;
const k = n => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Math.round(n)}`);

export function QuotaBars({ rows, title = "Quota attainment by rep" }) {
  const max = Math.max(120, ...rows.map(r => r.attainment));
  const W = 640, L = 170, R = 150, rowH = 34, H = rows.length * rowH + 30;
  const x = v => L + ((W - L - R) * v) / max;
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        {[0, 50, 100].map(t => <g key={t}><line className="grid" x1={x(t)} x2={x(t)} y1={6} y2={H - 22} /><text x={x(t)} y={H - 6} textAnchor="middle">{t}%</text></g>)}
        <line className="target" x1={x(100)} x2={x(100)} y1={2} y2={H - 22} />
        {rows.map((r, i) => {
          const y = 8 + i * rowH, w = Math.max(4, x(r.attainment) - L);
          return <g key={r.id}>
            <text className="lbl" x={L - 10} y={y + 15} textAnchor="end">{r.name.replace(" (sample)", "")}</text>
            <rect className="bar" x={L} y={y + 3} width={w} height={18} rx={4} tabIndex={0}><title>{`${r.name}: ${r.attainment}% of quota (${money(r.margin)} of ${money(r.monthly_quota)})`}</title></rect>
            <text x={W - R + 14} y={y + 16} className="lbl">{r.attainment}%</text>
            <text x={W - R + 54} y={y + 16}>{k(r.margin)} / {k(r.monthly_quota)}</text>
          </g>;
        })}
      </svg>
      <figcaption className="small muted">Dashed line = 100% of monthly gross-margin quota.</figcaption>
      <details className="small"><summary>Show as table</summary><table><thead><tr><th>Rep</th><th>Margin</th><th>Quota</th><th>Attainment</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{r.name}</td><td className="mono">{money(r.margin)}</td><td className="mono">{money(r.monthly_quota)}</td><td className="mono">{r.attainment}%</td></tr>)}</tbody></table></details>
    </figure>
  );
}

export function TrendColumns({ data, title = "Team gross margin by month" }) {
  const quota = data[0]?.quota || 0;
  const max = Math.max(quota * 1.15, ...data.map(d => d.margin)) || 1;
  const W = 640, H = 240, B = 30, T = 24, L = 50;
  const bw = (W - L - 20) / data.length;
  const y = v => H - B - ((H - B - T) * v) / max;
  const label = m => new Date(m + "-15").toLocaleString("en-US", { month: "short" });
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        {[0, 0.5, 1].map(f => <g key={f}><line className="grid" x1={L} x2={W - 10} y1={y(max * f)} y2={y(max * f)} /><text x={L - 8} y={y(max * f) + 4} textAnchor="end">{k(max * f)}</text></g>)}
        {quota > 0 && <><line className="target" x1={L} x2={W - 10} y1={y(quota)} y2={y(quota)} /><text x={W - 12} y={y(quota) - 6} textAnchor="end">Team quota {k(quota)}</text></>}
        {data.map((d, i) => {
          const cx = L + i * bw + bw / 2, h = Math.max(2, y(0) - y(d.margin));
          return <g key={d.month}>
            <rect className="bar" x={cx - bw * 0.28} y={y(d.margin)} width={bw * 0.56} height={h} rx={4} tabIndex={0}><title>{`${label(d.month)}: ${money(d.margin)}${quota ? ` (${Math.round((d.margin / quota) * 100)}% of quota)` : ""}`}</title></rect>
            <text className="lbl-in" x={cx} y={y(d.margin) + 18} textAnchor="middle">{k(d.margin)}</text>
            <text x={cx} y={H - 10} textAnchor="middle">{label(d.month)}{d.month === "2026-10" ? " (MTD)" : ""}</text>
          </g>;
        })}
      </svg>
      <details className="small"><summary>Show as table</summary><table><thead><tr><th>Month</th><th>Margin</th><th>Quota</th></tr></thead><tbody>{data.map(d => <tr key={d.month}><td>{d.month}</td><td className="mono">{money(d.margin)}</td><td className="mono">{money(d.quota)}</td></tr>)}</tbody></table></details>
    </figure>
  );
}

export function PipelineBars({ data, title = "Open pipeline by stage" }) {
  const max = Math.max(1, ...data.map(d => d.margin));
  const W = 640, L = 150, R = 120, rowH = 32, H = data.length * rowH + 8;
  const x = v => L + ((W - L - R) * v) / max;
  return (
    <figure style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        {data.map((d, i) => { const y = 4 + i * rowH, w = Math.max(d.margin ? 4 : 0, x(d.margin) - L); return <g key={d.stage}>
          <text className="lbl" x={L - 10} y={y + 15} textAnchor="end">{d.stage}</text>
          <rect className="bar" x={L} y={y + 3} width={w} height={18} rx={4} tabIndex={0}><title>{`${d.stage}: ${d.count} deals, ${money(d.margin)} est. margin`}</title></rect>
          <text x={L + w + 8} y={y + 16}>{k(d.margin)} · {d.count} deal{d.count === 1 ? "" : "s"}</text>
        </g>; })}
      </svg>
      <details className="small"><summary>Show as table</summary><table><thead><tr><th>Stage</th><th>Deals</th><th>Est. margin</th></tr></thead><tbody>{data.map(d => <tr key={d.stage}><td>{d.stage}</td><td className="mono">{d.count}</td><td className="mono">{money(d.margin)}</td></tr>)}</tbody></table></details>
    </figure>
  );
}
