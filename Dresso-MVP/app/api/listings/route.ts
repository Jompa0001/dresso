import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const size = searchParams.get("size") || undefined;
  const length = searchParams.get("length") || undefined;
  const color = searchParams.get("color") || undefined;
  const material = searchParams.get("material") || undefined;
  const brand = searchParams.get("brand") || undefined;
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
  const sort = (searchParams.get("sort") || "NEWEST") as "NEWEST"|"PRICE_ASC"|"PRICE_DESC";

  const where: any = { status: "ACTIVE" };
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }];
  if (size) where.size = size;
  if (length) where.length = length;
  if (color) where.color = color;
  if (material) where.material = material;
  if (brand) where.brand = brand;
  if (minPrice !== undefined || maxPrice !== undefined) where.price = {};
  if (minPrice !== undefined) where.price.gte = minPrice;
  if (maxPrice !== undefined) where.price.lte = maxPrice;

  const orderBy = sort === "PRICE_ASC" ? { price: "asc" } : sort === "PRICE_DESC" ? { price: "desc" } : [
    { highlight: "desc" as const },
    { bumpedAt: "desc" as const },
    { createdAt: "desc" as const },
  ];

  const [items, count] = await Promise.all([
    prisma.listing.findMany({ where, orderBy, take: 60 }),
    prisma.listing.count({ where }),
  ]);
  return NextResponse.json({ items, count });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, price, size, length, color, material, brand, images } = body;
  if (!title || !description) return NextResponse.json({ error: "Titel och beskrivning krävs." }, { status: 400 });
  const user = await prisma.user.upsert({
    where: { email: "demo@dresso.se" },
    update: {},
    create: { email: "demo@dresso.se", name: "Demo Seller" }
  });
  const created = await prisma.listing.create({
    data: { title, description, price: Number(price)||0, size, length, color, material, brand, images: Array.isArray(images) ? images : [], userId: user.id, publishPaid: false }
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
