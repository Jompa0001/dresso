import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Hämta meddelanden i en konversation
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId krävs" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

// Skicka meddelande i en konversation
export async function POST(req: NextRequest) {
  const { conversationId, body, from } = (await req.json()) as {
    conversationId: string;
    body: string;
    from: "buyer" | "seller";
  };

  if (!conversationId || !body) {
    return NextResponse.json({ error: "conversationId och body krävs" }, { status: 400 });
  }

  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return NextResponse.json({ error: "Konversation saknas" }, { status: 404 });

  const senderId = from === "seller" ? convo.sellerId : convo.buyerId;
  const recipientId = from === "seller" ? convo.buyerId : convo.sellerId;

  const msg = await prisma.message.create({
    data: {
      conversationId,
      listingId: convo.listingId,
      senderId,
      recipientId,
      content: body,
    },
  });

  return NextResponse.json({ ok: true, id: msg.id, createdAt: msg.createdAt });
}
