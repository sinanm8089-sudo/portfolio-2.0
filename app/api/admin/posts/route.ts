import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_LINKEDIN_POSTS } from "@/lib/db/default-data";
import { logAdminActivity } from "@/lib/db/queries";
import { linkedInPostSchema } from "@/lib/validation/schemas";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await prisma.linkedInPost.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({
      ok: true,
      posts: posts.length > 0 ? posts : DEFAULT_LINKEDIN_POSTS,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      posts: DEFAULT_LINKEDIN_POSTS,
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

  const parsed = linkedInPostSchema.safeParse(body);
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
    const created = await prisma.linkedInPost.create({ data: parsed.data });
    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "CREATE",
      entityType: "LinkedInPost",
      entityId: created.id,
      details: `Added LinkedIn post "${created.title}"`,
    });
    revalidatePath("/");
    return NextResponse.json({ ok: true, post: created });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error ? err.message : "Failed to create LinkedIn post",
      },
      { status: 500 }
    );
  }
}

