// app/api/chat/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { listingId } = (await req.json()) as { listingId: string };
    if (!listingId) {
      return NextResponse.json({ error: "listingId krävs" }, { status: 400 });
    }

    // hämta annons + säljare
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true },
    });
    if (!listing) {
      return NextResponse.json({ error: "Annons saknas" }, { status: 404 });
    }

    // demo/buyerkonto – byt till riktigt användar-id i din app
    const buyer = await prisma.user.upsert({
      where: { email: "buyer@dresso.se" },
      update: {},
      create: { email: "buyer@dresso.se" },
      select: { id: true },
    });

    // slå upp säljaren via listing.sellerId (inte userId)
    const seller = await prisma.user.findUnique({
      where: { id: listing.sellerId },
      select: { id: true },
    });
    if (!seller) {
      return NextResponse.json({ error: "Säljare saknas" }, { status: 400 });
    }

    // finns konversation redan?
    const existing = await prisma.conversation.findFirst({
      where: {
        listingId: listing.id,
        buyerId: buyer.id,
        sellerId: seller.id,
      },
      select: { id: true },
    });

    const convo =
      existing ??
      (await prisma.conversation.create({
        data: {
          listingId: listing.id,
          buyerId: buyer.id,
          sellerId: seller.id,
        },
        select: { id: true },
      }));

    return NextResponse.json({ ok: true, conversationId: convo.id });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Internt fel", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
