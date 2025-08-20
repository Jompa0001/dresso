import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
import { bulkListingFeeSEK } from "@/lib/pricing";
export async function POST(req: NextRequest) {
  const { listingIds } = await req.json() as { listingIds: string[] };
  if (!Array.isArray(listingIds) || !listingIds.length) return NextResponse.json({ error: "listingIds krävs" }, { status: 400 });
  const items = await prisma.listing.findMany({ where: { id: { in: listingIds } } });
  const n = items.length; const fee = bulkListingFeeSEK(n);
  const key = process.env.STRIPE_SECRET_KEY;
  const origin = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");
  const successUrl = `${origin}/checkout/success?type=bulk&ids=${encodeURIComponent(listingIds.join(","))}`;
  const cancelUrl = `${origin}/listings/new/bulk`;
  if (!key) { await prisma.listing.updateMany({ where: { id: { in: listingIds } }, data: { publishPaid: true, status: "ACTIVE" } }); return NextResponse.json({ url: successUrl }); }
  const stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  const session = await stripe.checkout.sessions.create({ mode: "payment", success_url: successUrl, cancel_url: cancelUrl, line_items: [{ price_data: { currency: "sek", product_data: { name: `Publiceringsavgift (${n} annonser)` }, unit_amount: fee * 100 }, quantity: 1 }], metadata: { type: "bulk", ids: listingIds.join(",") } });
  return NextResponse.json({ url: session.url });
}
