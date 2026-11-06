import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_CERTIFICATIONS } from "@/lib/db/default-data";
import { logAdminActivity } from "@/lib/db/queries";
import { certificationSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const certifications = await prisma.certification.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return NextResponse.json({
      ok: true,
      certifications:
        certifications.length > 0 ? certifications : DEFAULT_CERTIFICATIONS,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      certifications: DEFAULT_CERTIFICATIONS,
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

  const parsed = certificationSchema.safeParse(body);
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
    const created = await prisma.certification.create({ data: parsed.data });
    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "CREATE",
      entityType: "Certification",
      entityId: created.id,
      details: `Added certification "${created.title}"`,
    });
    revalidatePath("/");
    return NextResponse.json({ ok: true, certification: created });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error ? err.message : "Failed to create certification",
      },
      { status: 500 }
    );
  }
}

