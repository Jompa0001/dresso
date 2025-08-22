import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { listingId } = (await req.json()) as { listingId: string };
  if (!listingId) {
    return NextResponse.json({ error: "listingId krävs" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Annons saknas" }, { status: 404 });

  // Skapa / hämta en "köpare" (placeholder e-post om du inte har auth)
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@dresso.se" },
    update: {},
    create: { email: "buyer@dresso.se", name: "Buyer" },
  });

  // Säljaren är annonsens sellerId (OBS! inte listing.userId)
  const sellerId = listing.sellerId;

  const existing = await prisma.conversation.findFirst({
    where: { listingId, buyerId: buyer.id, sellerId },
  });

  const convo =
    existing ??
    (await prisma.conversation.create({
      data: { listingId, buyerId: buyer.id, sellerId },
    }));

  return NextResponse.json({ conversationId: convo.id });
}
