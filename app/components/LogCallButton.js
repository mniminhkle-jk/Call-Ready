"use client";
// Switches to the Notes tab and opens the PRN form.
export default function LogCallButton() {
  return <button type="button" className="btn secondary" data-guide="log-call-top" onClick={() => {
    window.dispatchEvent(new CustomEvent("cr:tab", { detail: "notes" }));
    setTimeout(() => window.dispatchEvent(new Event("cr:log-call")), 30);
  }}>Log a call</button>;
}
