import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { logAdminActivity } from "@/lib/db/queries";

const DEFAULT_MEDIA = [
  {
    id: "media-cert-1",
    filename: "CERT_SINAN_MOHAMMED_1760514672459.pdf",
    url: "/certificates/CERT_SINAN_MOHAMMED_1760514672459.pdf",
    mimeType: "application/pdf",
    sizeBytes: 162123,
    folder: "certificates",
    altText: "Sinan Mohammed Cyber Security Professional Certificate",
    createdAt: new Date("2025-10-15").toISOString(),
  },
];

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      ok: true,
      assets: assets.length > 0 ? assets : DEFAULT_MEDIA,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      assets: DEFAULT_MEDIA,
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

  const filename = String(body.filename || "").trim();
  const url = String(body.url || "").trim();
  const mimeType = String(body.mimeType || "image/png").trim();
  const folder = String(body.folder || "general").trim();
  const altText = body.altText ? String(body.altText) : null;

  if (!filename || !url) {
    return NextResponse.json(
      { ok: false, error: "Filename and URL are required" },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.mediaAsset.create({
      data: {
        filename,
        url,
        mimeType,
        sizeBytes: Number(body.sizeBytes || 0),
        folder,
        altText,
      },
    });

    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "CREATE",
      entityType: "MediaAsset",
      entityId: created.id,
      details: `Registered media asset "${created.filename}"`,
    });

    return NextResponse.json({ ok: true, asset: created });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to register media",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  try {
    await prisma.mediaAsset.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to delete asset",
      },
      { status: 500 }
    );
  }
}

