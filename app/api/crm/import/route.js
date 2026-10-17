import { importRows, parseCSV } from "@/lib/crm";
import { handle, json, fail, requireUser } from "@/lib/apiutil";
export const POST = handle(async req => {
  const user = await requireUser();
  const { system, object, csv, rows } = await req.json();
  if (!["salesforce", "hubspot"].includes(system)) return fail("system must be salesforce or hubspot.");
  const data = rows || parseCSV(csv || "");
  if (!data.length) return fail("No rows found. Upload the CSV exported from your CRM.");
  return json(await importRows(system, object, data, user.name));
});
