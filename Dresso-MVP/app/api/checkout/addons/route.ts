// app/api/checkout/addons/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const FEE_BUMP = Number(process.env.BUMP_FEE_SEK || 19);
const FEE_HIGHLIGHT = Number(process.env.HIGHLIGHT_FEE_SEK || 29);

// hur länge en highlight ska gälla
const HIGHLIGHT_DAYS = 7;

export async function POST(req: NextRequest) {
  const { listingId, addons } = (await req.json()) as {
    listingId: string;
    addons: ("bump" | "highlight")[];
  };

  if (!listingId || !addons?.length) {
    return NextResponse.json({ error: "listingId och addons krävs" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Annons saknas" }, { status: 404 });

  const key = process.env.STRIPE_SECRET_KEY;
  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const successQuery = new URLSearchParams({ listingId, addons: addons.join(","), type: "addons" }).toString();
  const successUrl = `${origin}/checkout/success?${successQuery}`;
  const cancelUrl = `${origin}/listings/${listingId}`;

  // Stripe line items
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  if (addons.includes("bump")) {
    line_items.push({
      price_data: { currency: "sek", product_data: { name: "Lyft annons (Bump)" }, unit_amount: FEE_BUMP * 100 },
      quantity: 1,
    });
  }
  if (addons.includes("highlight")) {
    line_items.push({
      price_data: { currency: "sek", product_data: { name: "Highlight" }, unit_amount: FEE_HIGHLIGHT * 100 },
      quantity: 1,
    });
  }

  // Om vi inte har Stripe-nyckel (t.ex. lokalt) – gör uppdateringen direkt och "fake-redirecta"
  if (!key) {
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        bumpedAt: addons.includes("bump") ? new Date() : undefined,
        // sätt highlightUntil i stället för ett boolean-fält
        highlightUntil: addons.includes("highlight")
          ? new Date(Date.now() + HIGHLIGHT_DAYS * 24 * 60 * 60 * 1000)
          : undefined,
      },
    });
    return NextResponse.json({ url: successUrl });
  }

  // Annars – skapa Stripe-checkout
  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items,
    metadata: { listingId, addons: addons.join(","), type: "addons" },
  });

  return NextResponse.json({ url: session.url });
}
