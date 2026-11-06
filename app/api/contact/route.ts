import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_SITE_SETTINGS } from "@/lib/db/default-data";
import { contactSubmissionSchema } from "@/lib/validation/schemas";
import { checkRateLimit, hashClientIp } from "@/lib/security/rate-limit";
import { sendContactNotificationEmail } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ipHash = hashClientIp(clientIp);

  const rateLimit = checkRateLimit(`contact:${ipHash}`, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `Rate limit exceeded. Try again in ${rateLimit.retryAfterSec}s.`,
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const parsed = contactSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || "Validation failed",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const { senderName, senderEmail, subject, category, message, honeypot } =
    parsed.data;

  // Silent honeypot drop for bots
  if (honeypot && honeypot.length > 0) {
    return NextResponse.json({ ok: true, id: "filtered" });
  }

  try {
    const saved = await prisma.contactMessage.create({
      data: {
        senderName,
        senderEmail,
        subject,
        category,
        message,
        status: "NEW",
        isSpam: false,
        ipHash,
      },
    });

    const settings =
      (await prisma.siteSettings.findUnique({ where: { id: "default" } })) ??
      DEFAULT_SITE_SETTINGS;

    let emailForwarded = false;
    if (settings.emailNotifications) {
      const targetEmail =
        settings.notifyEmail ||
        process.env.CONTACT_NOTIFICATION_EMAIL ||
        "sinan.m8089@gmail.com";
      const notifyRes = await sendContactNotificationEmail({
        toEmail: targetEmail,
        senderName,
        senderEmail,
        subject,
        category,
        message,
      });
      emailForwarded = notifyRes.sent;
    }

    return NextResponse.json({
      ok: true,
      id: saved.id,
      emailForwarded,
      message: "Packet delivered and logged in PostgreSQL inbox.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? `Database error: ${err.message}. Ensure PostgreSQL DATABASE_URL is configured and migrated.`
            : "Failed to store contact message in PostgreSQL.",
      },
      { status: 500 }
    );
  }
}

