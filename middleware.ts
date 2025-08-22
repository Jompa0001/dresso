import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (!isAdminPath) return NextResponse.next();
  const token = req.cookies.get("admin")?.value;
  const envToken = process.env.ADMIN_TOKEN;
  if (token && envToken && token === envToken) return NextResponse.next();
  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
