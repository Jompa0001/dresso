import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

// Standardavgift för att publicera en annons (kan sättas via ENV)
const PUBLICATION_FEE_SEK = Number(process.env.PUBLICATION_FEE_SEK || 99);

export async function POST(req: NextRequest) {
  const { listingId } = (await req.json()) as { listingId: string };
  if (!listingId) {
    return NextResponse.json({ error: "listingId krävs" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Annons saknas" }, { status: 404 });
  }

  const key = process.env.STRIPE_SECRET_KEY;

  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const successUrl = `${origin}/listings/${listingId}`;
  const cancelUrl = `${origin}/listings/new`;

  // Om ingen Stripe-nyckel är satt (t.ex. lokalt) – aktivera direkt
  if (!key) {
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: "ACTIVE" }, // inget publishPaid-fält i schemat
    });
    return NextResponse.json({ url: successUrl });
  }

  // Annars skapa Stripe Checkout-session
  const stripe = new Stripe(key);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        price_data: {
          currency: "sek",
          product_data: { name: "Publiceringsavgift (1 annons)" },
          unit_amount: PUBLICATION_FEE_SEK * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "single-publication",
      listingId,
    },
  });

  return NextResponse.json({ url: session.url });
}
