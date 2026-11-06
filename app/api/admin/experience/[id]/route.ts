import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { logAdminActivity } from "@/lib/db/queries";
import { educationSchema, experienceSchema } from "@/lib/validation/schemas";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.entity === "education") {
    const parsedEdu = educationSchema.partial().safeParse(body);
    if (!parsedEdu.success) {
      return NextResponse.json(
        { ok: false, error: "Validation error" },
        { status: 400 }
      );
    }
    try {
      const updated = await prisma.education.update({
        where: { id },
        data: parsedEdu.data,
      });
      revalidatePath("/");
      return NextResponse.json({ ok: true, education: updated });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "Failed" },
        { status: 500 }
      );
    }
  }

  const parsed = experienceSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation error" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.experience.update({
      where: { id },
      data: parsed.data,
    });
    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "UPDATE",
      entityType: "Experience",
      entityId: updated.id,
      details: `Updated experience "${updated.title}"`,
    });
    revalidatePath("/");
    return NextResponse.json({ ok: true, experience: updated });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const entity = request.nextUrl.searchParams.get("entity");

  try {
    if (entity === "education") {
      await prisma.education.delete({ where: { id } });
    } else {
      await prisma.experience.delete({ where: { id } });
    }
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}

