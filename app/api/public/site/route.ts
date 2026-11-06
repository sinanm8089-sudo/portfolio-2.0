import { NextResponse } from "next/server";
import { getPublicPortfolioData } from "@/lib/db/queries";

export async function GET() {
  const data = await getPublicPortfolioData();
  return NextResponse.json({
    ok: true,
    dbConnected: data.dbConnected,
    site: data.site,
    theme: data.theme,
    scene: data.scene,
    navigation: data.navigation,
    socialLinks: data.socialLinks,
  });
}

