import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_SITE_SETTINGS } from "@/lib/db/default-data";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "project_open",
  "github_click",
  "linkedin_open",
  "linkedin_visit",
  "contact_submit",
  "cv_download",
  "search_query",
]);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventType = String(body.eventType || "");
  if (!ALLOWED_EVENTS.has(eventType)) {
    return NextResponse.json({ ok: false, error: "Unsupported event" }, { status: 400 });
  }

  try {
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        path: String(body.path || "/").slice(0, 120),
        targetId: body.targetId ? String(body.targetId).slice(0, 120) : null,
      },
    });
  } catch {
    // Non-blocking if DB is not yet migrated
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const clarityProjectId =
    process.env.CLARITY_PROJECT_ID ||
    DEFAULT_SITE_SETTINGS.clarityProjectId ||
    "";

  try {
    const [events, settings] = await Promise.all([
      prisma.analyticsEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 250,
      }),
      prisma.siteSettings.findUnique({ where: { id: "default" } }),
    ]);

    const counts: Record<string, number> = {
      page_view: 0,
      project_open: 0,
      github_click: 0,
      linkedin_open: 0,
      linkedin_visit: 0,
      contact_submit: 0,
      cv_download: 0,
      search_query: 0,
    };

    for (const ev of events) {
      counts[ev.eventType] = (counts[ev.eventType] || 0) + 1;
    }

    return NextResponse.json({
      ok: true,
      dbConnected: true,
      clarityProjectId: settings?.clarityProjectId || clarityProjectId,
      counts,
      recentEvents: events.slice(0, 20),
    });
  } catch {
    return NextResponse.json({
      ok: true,
      dbConnected: false,
      clarityProjectId,
      counts: {
        page_view: 0,
        project_open: 0,
        github_click: 0,
        linkedin_open: 0,
        linkedin_visit: 0,
        contact_submit: 0,
        cv_download: 0,
        search_query: 0,
      },
      recentEvents: [],
    });
  }
}

