import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function POST(req: NextRequest) {
  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "listingId krävs" }, { status: 400 });
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Annons saknas" }, { status: 404 });
  const buyer = await prisma.user.upsert({ where: { email: "buyer@dresso.se" }, update: {}, create: { email: "buyer@dresso.se", name: "Demo Buyer" } });
  const seller = await prisma.user.findUnique({ where: { id: listing.userId } });
  if (!seller) return NextResponse.json({ error: "Säljare saknas" }, { status: 400 });
  const existing = await prisma.conversation.findFirst({ where: { listingId, buyerId: buyer.id, sellerId: seller.id } });
  const convo = existing || await prisma.conversation.create({ data: { listingId, buyerId: buyer.id, sellerId: seller.id } });
  return NextResponse.json({ id: convo.id });
}
