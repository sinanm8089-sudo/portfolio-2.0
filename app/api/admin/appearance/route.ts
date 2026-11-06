import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  DEFAULT_NAVIGATION,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_THEME_SETTINGS,
} from "@/lib/db/default-data";
import { logAdminActivity } from "@/lib/db/queries";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [theme, navigation, socialLinks, seo] = await Promise.all([
      prisma.themeSettings.findUnique({ where: { id: "default" } }),
      prisma.navigationItem.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.socialLink.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.seoMetadata.findUnique({ where: { pageSlug: "home" } }),
    ]);

    return NextResponse.json({
      ok: true,
      theme: theme ?? DEFAULT_THEME_SETTINGS,
      navigation: navigation.length > 0 ? navigation : DEFAULT_NAVIGATION,
      socialLinks: socialLinks.length > 0 ? socialLinks : DEFAULT_SOCIAL_LINKS,
      seo: seo ?? {
        pageSlug: "home",
        metaTitle: "Sinan Mohammed | Cybersecurity × AI × Full-Stack Portfolio",
        metaDescription:
          "Portfolio 2.0 of Sinan Mohammed — B.Tech Cyber Security student & developer.",
        canonicalUrl: "https://sinanm8089-sudo.github.io/",
        keywords: [
          "Sinan Mohammed",
          "Cybersecurity",
          "Penetration Testing",
          "Ethical Hacking",
        ],
        noIndex: false,
      },
    });
  } catch {
    return NextResponse.json({
      ok: true,
      dbConnected: false,
      theme: DEFAULT_THEME_SETTINGS,
      navigation: DEFAULT_NAVIGATION,
      socialLinks: DEFAULT_SOCIAL_LINKS,
      seo: {
        pageSlug: "home",
        metaTitle: "Sinan Mohammed | Cybersecurity × AI × Full-Stack Portfolio",
        metaDescription:
          "Portfolio 2.0 of Sinan Mohammed — B.Tech Cyber Security student & developer.",
        canonicalUrl: "https://sinanm8089-sudo.github.io/",
        keywords: ["Sinan Mohammed", "Cybersecurity"],
        noIndex: false,
      },
    });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.section === "theme" && body.theme) {
      const t = body.theme as Record<string, unknown>;
      const updated = await prisma.themeSettings.upsert({
        where: { id: "default" },
        update: {
          name: String(t.name || "Cybersecurity Command Center"),
          primaryColor: String(t.primaryColor || "#39FF88"),
          secondaryColor: String(t.secondaryColor || "#00D9FF"),
          bgPrimary: String(t.bgPrimary || "#050807"),
          bgSurface: String(t.bgSurface || "#0B1210"),
          textPrimary: String(t.textPrimary || "#F3F7F5"),
          textMuted: String(t.textMuted || "#87938D"),
          fontSans: String(t.fontSans || "Inter"),
          fontMono: String(t.fontMono || "Fira Code"),
          borderRadius: String(t.borderRadius || "0.5rem"),
          enableScanlines: Boolean(t.enableScanlines ?? true),
          enableGlitch: Boolean(t.enableGlitch ?? true),
        },
        create: {
          id: "default",
          name: String(t.name || "Cybersecurity Command Center"),
          primaryColor: String(t.primaryColor || "#39FF88"),
          secondaryColor: String(t.secondaryColor || "#00D9FF"),
          bgPrimary: String(t.bgPrimary || "#050807"),
          bgSurface: String(t.bgSurface || "#0B1210"),
          textPrimary: String(t.textPrimary || "#F3F7F5"),
          textMuted: String(t.textMuted || "#87938D"),
          fontSans: String(t.fontSans || "Inter"),
          fontMono: String(t.fontMono || "Fira Code"),
          borderRadius: String(t.borderRadius || "0.5rem"),
          enableScanlines: Boolean(t.enableScanlines ?? true),
          enableGlitch: Boolean(t.enableGlitch ?? true),
        },
      });
      revalidatePath("/");
      return NextResponse.json({ ok: true, theme: updated });
    }

    if (body.section === "seo" && body.seo) {
      const s = body.seo as Record<string, unknown>;
      const updated = await prisma.seoMetadata.upsert({
        where: { pageSlug: "home" },
        update: {
          metaTitle: String(s.metaTitle || ""),
          metaDescription: String(s.metaDescription || ""),
          canonicalUrl: String(s.canonicalUrl || ""),
          keywords: Array.isArray(s.keywords)
            ? s.keywords.map(String)
            : [],
          noIndex: Boolean(s.noIndex ?? false),
        },
        create: {
          pageSlug: "home",
          metaTitle: String(s.metaTitle || ""),
          metaDescription: String(s.metaDescription || ""),
          canonicalUrl: String(s.canonicalUrl || ""),
          keywords: Array.isArray(s.keywords)
            ? s.keywords.map(String)
            : [],
          noIndex: Boolean(s.noIndex ?? false),
        },
      });
      revalidatePath("/");
      return NextResponse.json({ ok: true, seo: updated });
    }

    if (body.section === "social" && Array.isArray(body.socialLinks)) {
      await prisma.socialLink.deleteMany({});
      for (const [idx, item] of (
        body.socialLinks as Array<Record<string, unknown>>
      ).entries()) {
        await prisma.socialLink.create({
          data: {
            platform: String(item.platform || "GitHub"),
            label: String(item.label || ""),
            url: String(item.url || ""),
            icon: String(item.icon || "Link"),
            displayOrder: idx + 1,
            isVisible: Boolean(item.isVisible ?? true),
          },
        });
      }
      revalidatePath("/");
      return NextResponse.json({ ok: true });
    }

    if (body.section === "navigation" && Array.isArray(body.navigation)) {
      await prisma.navigationItem.deleteMany({});
      for (const [idx, item] of (
        body.navigation as Array<Record<string, unknown>>
      ).entries()) {
        await prisma.navigationItem.create({
          data: {
            label: String(item.label || ""),
            href: String(item.href || "#"),
            displayOrder: idx + 1,
            isVisible: Boolean(item.isVisible ?? true),
            isExternal: Boolean(item.isExternal ?? false),
          },
        });
      }
      revalidatePath("/");
      return NextResponse.json({ ok: true });
    }

    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "UPDATE",
      entityType: "Appearance",
      details: `Updated appearance / navigation / SEO configuration`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to save changes",
      },
      { status: 500 }
    );
  }
}

