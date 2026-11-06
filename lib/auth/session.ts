import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

const SESSION_COOKIE_NAME = "portfolio_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    "portfolio-v2-sinan-mohammed-local-dev-secret-key-9f8e7d6c5b4a3210"
  );
}

export function hashToken(token: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(token).digest("hex");
}

function createSignedPayload(data: {
  userId: string;
  email: string;
  name: string;
  exp: number;
  nonce: string;
}): string {
  const payloadB64 = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

function verifySignedPayload(token: string): {
  userId: string;
  email: string;
  name: string;
  exp: number;
  nonce: string;
} | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", getAuthSecret())
    .update(payloadB64)
    .digest("base64url");

  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );
    if (!decoded.exp || Date.now() > decoded.exp) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function authenticateAdminCredentials(
  email: string,
  password: string
): Promise<{ id: string; email: string; name: string } | null> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;
      return { id: user.id, email: user.email, name: user.name };
    }

    // If no AdminUser exists yet in DB, bootstrap from env credentials on first login
    const adminCount = await prisma.adminUser.count();
    const envEmail = (
      process.env.ADMIN_EMAIL || "sinan.m8089@gmail.com"
    ).toLowerCase().trim();
    const envPass = process.env.ADMIN_PASSWORD || "CyberAdmin2026!";

    if (
      adminCount === 0 &&
      normalizedEmail === envEmail &&
      password === envPass
    ) {
      const passwordHash = await bcrypt.hash(password, 12);
      const created = await prisma.adminUser.create({
        data: {
          email: envEmail,
          passwordHash,
          name: "Sinan Mohammed",
          role: "ADMIN",
        },
      });
      return { id: created.id, email: created.email, name: created.name };
    }
  } catch {
    // Fallback to env credentials if PostgreSQL is not yet migrated during initial setup
    const envEmail = (
      process.env.ADMIN_EMAIL || "sinan.m8089@gmail.com"
    ).toLowerCase().trim();
    const envPass = process.env.ADMIN_PASSWORD || "CyberAdmin2026!";
    if (normalizedEmail === envEmail && password === envPass) {
      return {
        id: "env-admin",
        email: envEmail,
        name: "Sinan Mohammed",
      };
    }
  }

  return null;
}

export async function createAdminSession(user: {
  id: string;
  email: string;
  name: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const exp = Date.now() + SESSION_DURATION_MS;
  const nonce = crypto.randomBytes(16).toString("hex");
  const signedToken = createSignedPayload({
    userId: user.id,
    email: user.email,
    name: user.name,
    exp,
    nonce,
  });
  const tokenHash = hashToken(signedToken);

  if (user.id !== "env-admin") {
    try {
      await prisma.adminSession.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(exp),
          ipAddress: user.ipAddress,
          userAgent: user.userAgent,
        },
      });
    } catch {
      // Non-fatal if DB session table isn't migrated yet
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  });

  return signedToken;
}

export async function getAdminSession(): Promise<{
  userId: string;
  email: string;
  name: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = verifySignedPayload(token);
  if (!verified) return null;

  if (verified.userId !== "env-admin") {
    try {
      const tokenHash = hashToken(token);
      const dbSession = await prisma.adminSession.findUnique({
        where: { tokenHash },
      });
      if (!dbSession || dbSession.expiresAt < new Date()) {
        return null;
      }
    } catch {
      // Allow verified HMAC session if DB is temporarily unreachable
    }
  }

  return {
    userId: verified.userId,
    email: verified.email,
    name: verified.name,
  };
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      const tokenHash = hashToken(token);
      await prisma.adminSession.deleteMany({ where: { tokenHash } });
    } catch {
      // Ignore if session already removed
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

