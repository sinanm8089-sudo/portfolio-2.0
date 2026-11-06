import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_SCENE_SETTINGS } from "@/lib/db/default-data";
import { logAdminActivity } from "@/lib/db/queries";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const scene =
      (await prisma.sceneSettings.findUnique({ where: { id: "default" } })) ??
      DEFAULT_SCENE_SETTINGS;
    return NextResponse.json({ ok: true, scene });
  } catch {
    return NextResponse.json({
      ok: true,
      scene: DEFAULT_SCENE_SETTINGS,
      dbConnected: false,
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

  const data = {
    sceneKey: String(body.sceneKey || "hero_globe"),
    isEnabled: Boolean(body.isEnabled ?? true),
    preset: String(body.preset || "CYBER_MATRIX"),
    primaryColor: String(body.primaryColor || "#39FF88"),
    secondaryColor: String(body.secondaryColor || "#FF003C"),
    particleDensity: Number(body.particleDensity ?? 1500),
    animationSpeed: Number(body.animationSpeed ?? 1.0),
    rotationSpeed: Number(body.rotationSpeed ?? 0.5),
    desktopQuality: String(body.desktopQuality || "HIGH"),
    mobileQuality: String(body.mobileQuality || "MEDIUM"),
    reducedMotion: Boolean(body.reducedMotion ?? false),
  };

  try {
    const updated = await prisma.sceneSettings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });

    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "UPDATE",
      entityType: "SceneSettings",
      entityId: "default",
      details: `Updated 3D scene settings (${data.preset}, enabled=${data.isEnabled})`,
    });

    revalidatePath("/");
    return NextResponse.json({ ok: true, scene: updated });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to save 3D scene settings",
      },
      { status: 500 }
    );
  }
}

