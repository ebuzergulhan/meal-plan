import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN, COOKIE_NAME, PASSWORD } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  if (body.password !== PASSWORD) {
    return NextResponse.json({ error: "Yanlis sifre" }, { status: 401 });
  }

  const expires = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, AUTH_TOKEN, {
    httpOnly: true,
    sameSite: "strict",
    expires,
    path: "/",
  });
  return res;
}
