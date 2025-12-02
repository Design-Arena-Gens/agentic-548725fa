import { buildScheduler } from "@/lib/agent/providers/scheduler";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const appt = await buildScheduler().book(body);
    return NextResponse.json({ appt });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "booking_failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  try {
    const appt = await buildScheduler().reschedule(body);
    return NextResponse.json({ appt });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "reschedule_failed" }, { status: 500 });
  }
}
