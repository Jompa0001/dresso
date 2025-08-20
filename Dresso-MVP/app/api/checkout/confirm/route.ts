import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function POST(req: NextRequest) {
  const { listingId, addons, bulkIds } = await req.json() as { listingId?: string, addons?: string, bulkIds?: string };
  if (bulkIds) { const ids = bulkIds.split(",").filter(Boolean); if (ids.length) await prisma.listing.updateMany({ where: { id: { in: ids } }, data: { publishPaid: true, status: "ACTIVE" } }); return NextResponse.json({ ok: true }); }
  if (!listingId) return NextResponse.json({ error: "listingId krävs" }, { status: 400 });
  const arr = (addons || "").split(",").filter(Boolean);
  const data: any = {}; if (arr.includes("bump")) data.bumpedAt = new Date(); if (arr.includes("highlight")) data.highlight = true;
  if (Object.keys(data).length) await prisma.listing.update({ where: { id: listingId }, data });
  return NextResponse.json({ ok: true });
}
