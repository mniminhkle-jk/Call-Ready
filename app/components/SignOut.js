"use client";
export default function SignOut() {
  return <button type="button" onClick={async () => { await fetch("/api/logout", { method: "POST" }); window.location.href = "/login"; }}>Sign out</button>;
}
