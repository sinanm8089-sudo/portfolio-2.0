import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getPublicPortfolioData, logAdminActivity } from "@/lib/db/queries";
import { siteSettingsSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

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

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || "Validation error",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });

    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "UPDATE",
      entityType: "SiteSettings",
      entityId: "default",
      details: "Updated global site, hero, about, and notification settings",
    });

    revalidatePath("/");
    return NextResponse.json({ ok: true, site: updated });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to save settings to PostgreSQL",
      },
      { status: 500 }
    );
  }
}

