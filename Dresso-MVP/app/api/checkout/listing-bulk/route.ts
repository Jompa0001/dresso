import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { listingIds, fee } = (await req.json()) as {
    listingIds: string[];
    fee: number; // totalavgiften (för alla annonser)
  };

  if (!listingIds?.length || !fee) {
    return NextResponse.json(
      { error: "listingIds och fee krävs" },
      { status: 400 }
    );
  }

  const n = listingIds.length;

  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const successUrl = `${origin}/checkout/success?type=bulk&ids=${encodeURIComponent(
    listingIds.join(",")
  )}`;
  const cancelUrl = `${origin}/listings/new/bulk`;

  const key = process.env.STRIPE_SECRET_KEY;

  // Om Stripe-nyckel saknas: publicera direkt (endast status, inget publishPaid-fält finns)
  if (!key) {
    await prisma.listing.updateMany({
      where: { id: { in: listingIds } },
      data: { status: "ACTIVE" },
    });
    return NextResponse.json({ url: successUrl });
  }

  const stripe = new Stripe(key);

  // Skapa en enda rad med totalavgiften (fee är totalen)
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        price_data: {
          currency: "sek",
          product_data: { name: `Publiceringsavgift (${n} annonser)` },
          unit_amount: Math.round(fee * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "bulk",
      ids: listingIds.join(","),
    },
  });

  return NextResponse.json({ url: session.url });
}
