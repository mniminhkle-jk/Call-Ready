import { NextResponse } from "next/server";
import { exportRows, toCSV } from "@/lib/crm";
import { handle, fail, requireUser } from "@/lib/apiutil";
export const dynamic = "force-dynamic";
export const GET = handle(async req => {
  await requireUser();
  const u = new URL(req.url);
  const system = u.searchParams.get("system"), object = u.searchParams.get("object"), format = u.searchParams.get("format") || "csv";
  if (!["salesforce", "hubspot"].includes(system)) return fail("system must be salesforce or hubspot.");
  const rows = await exportRows(system, object);
  const name = `callready-${system}-${object}-${new Date().toISOString().slice(0, 10)}`;
  if (format === "json") return NextResponse.json(rows, { headers: { "content-disposition": `attachment; filename="${name}.json"` } });
  return new NextResponse(toCSV(rows), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}.csv"` } });
});
