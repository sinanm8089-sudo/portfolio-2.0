import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { logAdminActivity } from "@/lib/db/queries";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  await logAdminActivity({
    userId: session.userId !== "env-admin" ? session.userId : undefined,
    action: "PUBLISH",
    entityType: "Site",
    details: "Revalidated public portfolio cache tags and routes",
  });

  return NextResponse.json({
    ok: true,
    publishedAt: new Date().toISOString(),
  });
}

