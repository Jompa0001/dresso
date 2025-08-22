import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const HIGHLIGHT_DAYS = 7;

export async function POST(req: NextRequest) {
  const { listingId, addons, bulkIds } = (await req.json()) as {
    listingId?: string;
    addons?: string;   // t.ex. "bump,highlight"
    bulkIds?: string;  // t.ex. "id1,id2"
  };

  // Bulk: publicera annonser (inget publishPaid-fält i schemat)
  if (bulkIds) {
    const ids = bulkIds.split(",").filter(Boolean);
    if (ids.length) {
      await prisma.listing.updateMany({
        where: { id: { in: ids } },
        data: { status: "ACTIVE" },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (!listingId) {
    return NextResponse.json({ error: "listingId krävs" }, { status: 400 });
  }

  const arr = (addons || "").split(",").filter(Boolean);
  const data: any = { status: "ACTIVE" };
  if (arr.includes("bump")) data.bumpedAt = new Date();
  if (arr.includes("highlight")) {
    data.highlightUntil = new Date(Date.now() + HIGHLIGHT_DAYS * 24 * 60 * 60 * 1000);
  }

  await prisma.listing.update({ where: { id: listingId }, data });
  return NextResponse.json({ ok: true });
}
