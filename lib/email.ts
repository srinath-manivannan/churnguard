import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let _transporter: Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const info = await getTransporter().sendMail({
    from: `"ChurnGuard" <${process.env.GMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
  });

  return {
    success: true,
    messageId: info.messageId,
  };
}

export async function verifyEmailConfig() {
  try {
    await getTransporter().verify();
    return true;
  } catch {
    return false;
  }
}
