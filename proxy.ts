import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "yp_auth";
const PASSWORD = process.env.PASSWORD || "ailem2015";

async function computeToken(password: string): Promise<string> {
  const data = new TextEncoder().encode("yemek:" + password);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const expected = await computeToken(PASSWORD);
  if (token !== expected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon|favicon_io).*)"],
};
