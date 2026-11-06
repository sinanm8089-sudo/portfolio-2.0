import { NextResponse } from "next/server";
import { getNeonServicesStatus } from "@/lib/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getNeonServicesStatus();
  return NextResponse.json({
    ok: true,
    services: status,
    timestamp: new Date().toISOString(),
  });
}
