import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { logAdminActivity } from "@/lib/db/queries";
import { skillSchema } from "@/lib/validation/schemas";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = skillSchema.partial().safeParse(body);
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
    const updated = await prisma.skill.update({
      where: { id },
      data: parsed.data,
    });
    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "UPDATE",
      entityType: "Skill",
      entityId: updated.id,
      details: `Updated skill "${updated.name}"`,
    });
    revalidatePath("/");
    return NextResponse.json({ ok: true, skill: updated });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to update skill",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const deleted = await prisma.skill.delete({ where: { id } });
    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "DELETE",
      entityType: "Skill",
      entityId: id,
      details: `Deleted skill "${deleted.name}"`,
    });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to delete skill",
      },
      { status: 500 }
    );
  }
}

