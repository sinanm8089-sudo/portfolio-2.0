import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { logAdminActivity } from "@/lib/db/queries";
import { contactReplySchema } from "@/lib/validation/schemas";
import { sendAdminReplyEmail } from "@/lib/email/resend";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || "Validation failed",
      },
      { status: 400 }
    );
  }

  try {
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!contactMessage) {
      return NextResponse.json(
        { ok: false, error: "Contact message not found" },
        { status: 404 }
      );
    }

    const emailResult = await sendAdminReplyEmail({
      recipientEmail: contactMessage.senderEmail,
      recipientName: contactMessage.senderName,
      subject: parsed.data.subject,
      body: parsed.data.body,
      replyToEmail: session.email,
    });

    const savedReply = await prisma.contactReply.create({
      data: {
        messageId: id,
        adminEmail: session.email,
        subject: parsed.data.subject,
        body: parsed.data.body,
        resendMessageId: emailResult.messageId || null,
      },
    });

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { status: "REPLIED" },
      include: { replies: { orderBy: { sentAt: "asc" } } },
    });

    await logAdminActivity({
      userId: session.userId !== "env-admin" ? session.userId : undefined,
      action: "REPLY",
      entityType: "ContactMessage",
      entityId: id,
      details: `Replied to ${contactMessage.senderEmail} (${
        emailResult.sent ? "Email sent via Resend" : "Saved in DB"
      })`,
    });

    return NextResponse.json({
      ok: true,
      reply: savedReply,
      message: updatedMessage,
      emailDelivered: emailResult.sent,
      emailNotice: emailResult.error,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to process reply",
      },
      { status: 500 }
    );
  }
}

