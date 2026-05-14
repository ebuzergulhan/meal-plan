import { NextRequest, NextResponse } from "next/server";
import { readState, writeState } from "@/lib/data";
import { AUTH_TOKEN, COOKIE_NAME } from "@/lib/auth";

function authorized(req: NextRequest): boolean {
  return req.cookies.get(COOKIE_NAME)?.value === AUTH_TOKEN;
}

export async function GET(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "Giris gerekli" }, { status: 401 });
  const state = await readState();
  return NextResponse.json(state);
}

export async function PUT(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "Giris gerekli" }, { status: 401 });
  const state = await req.json();
  await writeState(state);
  return NextResponse.json({ ok: true });
}
