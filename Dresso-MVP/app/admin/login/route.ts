import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const envToken = process.env.ADMIN_TOKEN;
  if (!envToken || token !== envToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  return res;
}
