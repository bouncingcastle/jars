import { NextResponse } from "next/server";
import { syncScheduledAllowances } from "@/lib/store";

export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await syncScheduledAllowances();
  return NextResponse.json({ ok: true });
}
