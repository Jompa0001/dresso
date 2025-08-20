import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";
export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whsec) return NextResponse.json({ error: "Stripe ej konfigurerat" }, { status: 400 });
  const sig = req.headers.get("stripe-signature") as string;
  const raw = await req.text();
  const stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(raw, sig, whsec); } catch (err: any) { return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 }); }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const listingId = (session.metadata?.listingId || "") as string;
    const type = (session.metadata?.type || "") as string;
    if (listingId) {
      if (type === "listing_fee") {
        await prisma.listing.update({ where: { id: listingId }, data: { publishPaid: true, status: "ACTIVE" } });
      } else if (type === "addons") {
        const addons = (session.metadata?.addons || "").split(",").filter(Boolean);
        await prisma.listing.update({ where: { id: listingId }, data: { bumpedAt: addons.includes("bump") ? new Date() : undefined, highlight: addons.includes("highlight") ? true : undefined } });
      }
    }
  }
  return NextResponse.json({ received: true });
}
export const config = { api: { bodyParser: false } } as any;
