import { NextResponse } from "next/server";
import { accountBundle } from "@/lib/data";
import { briefDocx } from "@/lib/docx";
import { briefMarkdown } from "@/lib/compose";
import { handle, fail, requireUser } from "@/lib/apiutil";
export const GET = handle(async (req, { params }) => {
  await requireUser();
  const b = await accountBundle(params.id);
  if (!b) return fail("Account not found.", 404);
  const ctx = { signals: b.signals, notes: b.notes, contacts: b.contacts };
  const format = new URL(req.url).searchParams.get("format") || "docx";
  const date = new Date().toISOString().slice(0, 10);
  if (format === "md") {
    return new NextResponse(briefMarkdown(b.account, ctx), { headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": `attachment; filename="${b.account.id}-brief-${date}.md"` } });
  }
  const buf = await briefDocx(b.account, ctx);
  return new NextResponse(buf, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "content-disposition": `attachment; filename="${b.account.id}-brief-${date}.docx"` } });
});
export const dynamic = "force-dynamic";
