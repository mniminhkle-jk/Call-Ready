"use client";
import { api } from "./api";
export default function BriefDownload({ contactId, accountId, name }) {
  const log = () => api("/api/activity", "POST", { account_id: accountId, contact_id: contactId, kind: "brief-downloaded", detail: name }).catch(() => {});
  return (
    <div className="row">
      <a className="btn" href={`/api/contacts/${contactId}/brief?format=docx`} onClick={log}>Download brief (.docx)</a>
      <a className="btn secondary" href={`/api/contacts/${contactId}/brief?format=md`} onClick={log}>Markdown</a>
    </div>
  );
}
