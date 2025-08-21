import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
const FEE_SEK = Number(process.env.LISTING_FEE_SEK || 99);
export async function POST(req: NextRequest) {
  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "listingId krävs" }, { status: 400 });
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Annons saknas" }, { status: 404 });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) { await prisma.listing.update({ where: { id: listingId }, data: { publishPaid: true, status: "ACTIVE" } }); return NextResponse.json({ url: `/listings/${listingId}` }); }
  const stripe = new Stripe(key);
  const origin = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${origin}/checkout/success?listingId=${listingId}&type=listing_fee`,
    cancel_url: `${origin}/listings/new`,
    line_items: [{ price_data: { currency: "sek", product_data: { name: "Publiceringsavgift annons" }, unit_amount: FEE_SEK * 100 }, quantity: 1 }],
    metadata: { listingId, type: "listing_fee" }
  });
  return NextResponse.json({ url: session.url });
}
