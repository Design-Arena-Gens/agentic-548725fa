import { buildScheduler } from "@/lib/agent/providers/scheduler";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fromIso = searchParams.get("fromIso") || undefined;
  const toIso = searchParams.get("toIso") || undefined;
  try {
    const slots = await buildScheduler().getAvailability({ fromIso, toIso });
    return NextResponse.json({ slots });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "availability_failed" }, { status: 500 });
  }
}
