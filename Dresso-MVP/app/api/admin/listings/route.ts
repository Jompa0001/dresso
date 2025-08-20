import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET(req: NextRequest) {
  const items = await prisma.listing.findMany({ orderBy: [{ createdAt: "desc" }], take: 100 });
  return NextResponse.json({ items });
}
