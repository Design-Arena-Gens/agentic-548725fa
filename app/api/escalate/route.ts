import { NextResponse } from "next/server";

// Simple endpoint to capture escalations. In real usage, forward to email/helpdesk.
const escalations: any[] = [];

export async function POST(req: Request) {
  const body = await req.json();
  escalations.push({ ...body, at: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ escalations });
}
