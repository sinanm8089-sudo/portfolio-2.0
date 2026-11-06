import { NextResponse } from "next/server";
import { destroyAdminSession, getAdminSession } from "@/lib/auth/session";
import { logAdminActivity } from "@/lib/db/queries";

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "LOGOUT",
      entityType: "AdminSession",
      details: `Admin logout for ${session.email}`,
    });
  }

  await destroyAdminSession();
  return NextResponse.json({ ok: true });
}

