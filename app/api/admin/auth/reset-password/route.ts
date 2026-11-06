import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { logAdminActivity } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { ok: false, error: "New password must be at least 6 characters." },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { email: session.email },
    });

    if (user && currentPassword) {
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return NextResponse.json(
          { ok: false, error: "Current password does not match." },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.adminUser.upsert({
      where: { email: session.email },
      update: { passwordHash },
      create: {
        email: session.email,
        passwordHash,
        name: session.name || "Sinan Mohammed",
        role: "ADMIN",
      },
    });

    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "UPDATE",
      entityType: "AdminUser",
      details: `Password changed for ${session.email}`,
    });

    return NextResponse.json({
      ok: true,
      message: "Admin password successfully updated in PostgreSQL.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to reset password",
      },
      { status: 500 }
    );
  }
}

