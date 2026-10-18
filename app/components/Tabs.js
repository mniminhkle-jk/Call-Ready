"use client";
import { useEffect, useRef, useState } from "react";

// Accessible tabs: role=tablist/tab/tabpanel, arrow keys move between tabs.
export default function Tabs({ tabs, panels, initial = 0 }) {
  const [i, setI] = useState(initial);
  const refs = useRef([]);
  useEffect(() => {
    const fromHash = () => { const k = tabs.findIndex(t => `#${t.id}` === window.location.hash); if (k >= 0) setI(k); };
    const fromEvent = e => { const k = tabs.findIndex(t => t.id === e.detail); if (k >= 0) setI(k); };
    fromHash(); window.addEventListener("hashchange", fromHash); window.addEventListener("cr:tab", fromEvent);
    return () => { window.removeEventListener("hashchange", fromHash); window.removeEventListener("cr:tab", fromEvent); };
  }, [tabs]);
  const onKey = e => {
    const n = tabs.length; let k = null;
    if (e.key === "ArrowRight") k = (i + 1) % n; else if (e.key === "ArrowLeft") k = (i - 1 + n) % n; else if (e.key === "Home") k = 0; else if (e.key === "End") k = n - 1;
    if (k != null) { e.preventDefault(); setI(k); refs.current[k]?.focus(); }
  };
  return (
    <div>
      <div className="tablist" role="tablist" aria-label="Contact sections" onKeyDown={onKey}>
        {tabs.map((t, k) => <button key={t.id} ref={el => (refs.current[k] = el)} type="button" role="tab" id={`tab-${t.id}`} aria-controls={`panel-${t.id}`} aria-selected={i === k} tabIndex={i === k ? 0 : -1} data-guide={`tab-${t.id}`} onClick={() => setI(k)}>{t.label}{t.count != null ? <span className="count">{t.count}</span> : null}</button>)}
      </div>
      {tabs.map((t, k) => <div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={i !== k} className="tabpanel" tabIndex={0}>{panels[k]}</div>)}
    </div>
  );
}
