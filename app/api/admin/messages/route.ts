import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { logAdminActivity } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const statusFilter = request.nextUrl.searchParams.get("status");
  const search = (request.nextUrl.searchParams.get("q") || "").trim();

  try {
    const messages = await prisma.contactMessage.findMany({
      where: {
        ...(statusFilter &&
        ["NEW", "READ", "REPLIED", "ARCHIVED"].includes(statusFilter)
          ? { status: statusFilter as "NEW" | "READ" | "REPLIED" | "ARCHIVED" }
          : {}),
        ...(search
          ? {
              OR: [
                { senderName: { contains: search, mode: "insensitive" } },
                { senderEmail: { contains: search, mode: "insensitive" } },
                { subject: { contains: search, mode: "insensitive" } },
                { message: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        replies: {
          orderBy: { sentAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      dbConnected: true,
      messages,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      dbConnected: false,
      messages: [],
    });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string; status?: "NEW" | "READ" | "REPLIED" | "ARCHIVED" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || !body.status) {
    return NextResponse.json(
      { ok: false, error: "id and status are required" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.contactMessage.update({
      where: { id: body.id },
      data: { status: body.status },
      include: { replies: true },
    });

    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "UPDATE",
      entityType: "ContactMessage",
      entityId: updated.id,
      details: `Marked message from ${updated.senderEmail} as ${body.status}`,
    });

    return NextResponse.json({ ok: true, message: updated });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to update status",
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
    return NextResponse.json(
      { ok: false, error: "Message id is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.contactMessage.delete({ where: { id } });
    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "DELETE",
      entityType: "ContactMessage",
      entityId: id,
      details: `Deleted contact message ${id}`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to delete message",
      },
      { status: 500 }
    );
  }
}

