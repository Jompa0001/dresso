import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: any = {};
  if (body.status) data.status = body.status;
  if (typeof body.highlight === "boolean") data.highlight = body.highlight;
  if (body.bumpedAt) data.bumpedAt = new Date(body.bumpedAt);
  const item = await prisma.listing.update({ where: { id: params.id }, data });
  return NextResponse.json(item);
}
