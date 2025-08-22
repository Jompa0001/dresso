import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const FEE_BUMP_SEK = Number(process.env.BUMP_FEE_SEK || 19);
const FEE_HIGHLIGHT_SEK = Number(process.env.HIGHLIGHT_FEE_SEK || 29);
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

  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const successUrl = `${origin}/checkout/success?listingId=${listingId}`;
  const cancelUrl = `${origin}/listings/${listingId}`;

  const key = process.env.STRIPE_SECRET_KEY;

  // Om Stripe-nyckel saknas: applicera uppgraderingar direkt och returnera
  if (!key) {
    const data: any = {};
    if (addons.includes("bump")) data.bumpedAt = new Date();
    if (addons.includes("highlight"))
      data.highlightUntil = new Date(Date.now() + HIGHLIGHT_DAYS * 24 * 60 * 60 * 1000);

    await prisma.listing.update({ where: { id: listingId }, data });
    return NextResponse.json({ url: successUrl });
  }

  const stripe = new Stripe(key);

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  if (addons.includes("bump")) {
    line_items.push({
      price_data: {
        currency: "sek",
        product_data: { name: "Lyft annons (Bump)" },
        unit_amount: FEE_BUMP_SEK * 100,
      },
      quantity: 1,
    });
  }
  if (addons.includes("highlight")) {
    line_items.push({
      price_data: {
        currency: "sek",
        product_data: { name: "Highlight" },
        unit_amount: FEE_HIGHLIGHT_SEK * 100,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items,
    metadata: {
      listingId,
      addons: addons.join(","),
      type: "addons",
    },
  });

  return NextResponse.json({ url: session.url });
}
