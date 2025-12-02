import { BUSINESS } from "@/lib/agent/business";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ business: BUSINESS });
}
