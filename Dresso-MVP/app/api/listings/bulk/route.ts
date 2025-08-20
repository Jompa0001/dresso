import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { drafts } = await req.json() as { drafts: any[] };
  if (!Array.isArray(drafts) || !drafts.length) return NextResponse.json({ error: "Inga utkast" }, { status: 400 });
  const user = await prisma.user.upsert({ where: { email: "demo@dresso.se" }, update: {}, create: { email: "demo@dresso.se", name: "Demo Seller" } });
  const listingIds: string[] = [];
  for (const d of drafts) {
    if (!d?.title || !d?.price) continue;
    const created = await prisma.listing.create({
      data: { title: d.title, description: d.description || "", price: Number(d.price) || 0, size: d.size, length: d.length, color: d.color, material: d.material, brand: d.brand, images: Array.isArray(d.images) ? d.images : [], userId: user.id, publishPaid: false }
    });
    listingIds.push(created.id);
  }
  if (!listingIds.length) return NextResponse.json({ error: "Inga giltiga utkast" }, { status: 400 });
  return NextResponse.json({ listingIds }, { status: 201 });
}
