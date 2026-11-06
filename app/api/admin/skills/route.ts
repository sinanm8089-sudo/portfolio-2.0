import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_SKILL_CATEGORIES } from "@/lib/db/default-data";
import { logAdminActivity } from "@/lib/db/queries";
import { skillCategorySchema, skillSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        skills: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
    return NextResponse.json({
      ok: true,
      skillCategories:
        categories.length > 0 ? categories : DEFAULT_SKILL_CATEGORIES,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      skillCategories: DEFAULT_SKILL_CATEGORIES,
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

  // Support creating either a skill or a category
  if (body.entity === "category") {
    const parsedCat = skillCategorySchema.safeParse(body);
    if (!parsedCat.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedCat.error.issues[0]?.message || "Invalid category",
        },
        { status: 400 }
      );
    }
    try {
      const cat = await prisma.skillCategory.create({ data: parsedCat.data });
      revalidatePath("/");
      return NextResponse.json({ ok: true, category: cat });
    } catch (err) {
      return NextResponse.json(
        {
          ok: false,
          error: err instanceof Error ? err.message : "Failed to create category",
        },
        { status: 500 }
      );
    }
  }

  const parsed = skillSchema.safeParse(body);
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
    const created = await prisma.skill.create({ data: parsed.data });
    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "CREATE",
      entityType: "Skill",
      entityId: created.id,
      details: `Added skill "${created.name}" (${created.proficiency}%)`,
    });
    revalidatePath("/");
    return NextResponse.json({ ok: true, skill: created });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to create skill",
      },
      { status: 500 }
    );
  }
}

