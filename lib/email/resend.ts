import { Resend } from "resend";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;
  return new Resend(apiKey);
}

export async function sendContactNotificationEmail(params: {
  toEmail: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  category: string;
  message: string;
}): Promise<{ sent: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  const fromAddress =
    process.env.RESEND_FROM || "Portfolio 2.0 <onboarding@resend.dev>";

  try {
    const response = await resend.emails.send({
      from: fromAddress,
      to: [params.toEmail],
      replyTo: params.senderEmail,
      subject: `[Portfolio 2.0 // ${params.category}] ${params.subject}`,
      text: [
        `New Contact Transmission Received on Portfolio 2.0`,
        `--------------------------------------------------`,
        `Sender: ${params.senderName} <${params.senderEmail}>`,
        `Category: ${params.category}`,
        `Subject: ${params.subject}`,
        ``,
        `Message:`,
        params.message,
      ].join("\n"),
    });

    return {
      sent: !response.error,
      messageId: response.data?.id,
      error: response.error?.message,
    };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

export async function sendAdminReplyEmail(params: {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  replyToEmail?: string;
}): Promise<{ sent: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return {
      sent: false,
      error:
        "RESEND_API_KEY is not set in .env. Reply was saved to PostgreSQL, but email delivery requires RESEND_API_KEY.",
    };
  }

  const fromAddress =
    process.env.RESEND_FROM || "Sinan Mohammed <onboarding@resend.dev>";

  try {
    const response = await resend.emails.send({
      from: fromAddress,
      to: [params.recipientEmail],
      replyTo: params.replyToEmail,
      subject: params.subject,
      text: `Hi ${params.recipientName},\n\n${params.body}\n\n--\nSinan Mohammed\nCybersecurity & Full-Stack Developer`,
    });

    return {
      sent: !response.error,
      messageId: response.data?.id,
      error: response.error?.message,
    };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Failed to send reply email",
    };
  }
}

