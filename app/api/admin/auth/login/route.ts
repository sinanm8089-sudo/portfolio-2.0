import { NextRequest, NextResponse } from "next/server";
import {
  authenticateAdminCredentials,
  createAdminSession,
} from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";
import { checkRateLimit, hashClientIp } from "@/lib/security/rate-limit";
import { logAdminActivity } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ipHash = hashClientIp(clientIp);

  const rl = checkRateLimit(`login:${ipHash}`, 8, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many login attempts. Locked for ${rl.retryAfterSec}s.`,
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload" },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid credentials format",
      },
      { status: 400 }
    );
  }

  const user = await authenticateAdminCredentials(
    parsed.data.email,
    parsed.data.password
  );

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "ACCESS DENIED // Invalid email or password." },
      { status: 401 }
    );
  }

  await createAdminSession({
    id: user.id,
    email: user.email,
    name: user.name,
    ipAddress: ipHash,
    userAgent: request.headers.get("user-agent") || undefined,
  });

  await logAdminActivity({
    userId: user.id !== "env-admin" ? user.id : undefined,
    action: "LOGIN",
    entityType: "AdminSession",
    details: `Admin login for ${user.email}`,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

