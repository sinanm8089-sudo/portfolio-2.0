import { NextResponse } from "next/server";
import { getPublicPortfolioData } from "@/lib/db/queries";

export async function GET() {
  const data = await getPublicPortfolioData();
  return NextResponse.json({
    ok: true,
    certifications: data.certifications,
  });
}

