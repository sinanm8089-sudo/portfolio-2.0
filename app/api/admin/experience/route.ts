import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_EDUCATION, DEFAULT_EXPERIENCE } from "@/lib/db/default-data";
import { logAdminActivity } from "@/lib/db/queries";
import { educationSchema, experienceSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [experience, education] = await Promise.all([
      prisma.experience.findMany({ orderBy: { displayOrder: "asc" } }),
      prisma.education.findMany({ orderBy: { displayOrder: "asc" } }),
    ]);

    return NextResponse.json({
      ok: true,
      experience: experience.length > 0 ? experience : DEFAULT_EXPERIENCE,
      education: education.length > 0 ? education : DEFAULT_EDUCATION,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      experience: DEFAULT_EXPERIENCE,
      education: DEFAULT_EDUCATION,
      dbConnected: false,
    });
  }
}

export async function POST(request: NextRequest) {
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

  if (body.entity === "education") {
    const parsedEdu = educationSchema.safeParse(body);
    if (!parsedEdu.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedEdu.error.issues[0]?.message || "Validation error",
        },
        { status: 400 }
      );
    }

    try {
      const created = await prisma.education.create({ data: parsedEdu.data });
      await logAdminActivity({
        userId: session.userId !== "env-admin" ? session.userId : undefined,
        action: "CREATE",
        entityType: "Education",
        entityId: created.id,
        details: `Added education "${created.degree}"`,
      });
      revalidatePath("/");
      return NextResponse.json({ ok: true, education: created });
    } catch (err) {
      return NextResponse.json(
        {
          ok: false,
          error: err instanceof Error ? err.message : "Failed to save education",
        },
        { status: 500 }
      );
    }
  }

  const parsed = experienceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || "Validation error",
      },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.experience.create({ data: parsed.data });
    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "CREATE",
      entityType: "Experience",
      entityId: created.id,
      details: `Added experience "${created.title}"`,
    });
    revalidatePath("/");
    return NextResponse.json({ ok: true, experience: created });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to save experience",
      },
      { status: 500 }
    );
  }
}

