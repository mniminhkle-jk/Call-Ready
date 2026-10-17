"use client";
import { useState } from "react";
export default function CopyButton({ text, label = "Copy", className = "btn secondary" }) {
  const [done, setDone] = useState(false);
  return <button type="button" className={className} onClick={async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); }
    catch { window.prompt?.("Copy this text:", text); }
  }}>{done ? "Copied" : label}</button>;
}
