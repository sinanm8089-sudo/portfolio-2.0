import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_PROJECTS } from "@/lib/db/default-data";
import { getGitHubProjects } from "@/lib/github";
import { logAdminActivity } from "@/lib/db/queries";
import { projectSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: { images: true },
    });
    const merged = await getGitHubProjects(
      projects.length > 0 ? projects : DEFAULT_PROJECTS
    );
    return NextResponse.json({
      ok: true,
      projects: merged,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      projects: await getGitHubProjects(DEFAULT_PROJECTS),
      dbConnected: false,
    });
  }
}

export async function POST(request: NextRequest) {
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

  const parsed = projectSchema.safeParse(body);
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
    const created = await prisma.project.create({
      data: {
        ...parsed.data,
        githubUrl: parsed.data.githubUrl || null,
        liveUrl: parsed.data.liveUrl || null,
      },
    });

    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "CREATE",
      entityType: "Project",
      entityId: created.id,
      details: `Created project "${created.title}" (${created.status})`,
    });

    revalidatePath("/");
    return NextResponse.json({ ok: true, project: created });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to create project in PostgreSQL",
      },
      { status: 500 }
    );
  }
}

