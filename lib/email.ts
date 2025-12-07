import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  try {
    console.log("📧 Sending email via Gmail SMTP...");
    console.log("   To:", to);
    console.log("   From:", process.env.GMAIL_USER);
    console.log("   Subject:", subject);

    const info = await transporter.sendMail({
      from: `"ChurnGuard" <${process.env.GMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject: subject,
      html: html,
    });

    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);

    return { 
      success: true, 
      messageId: info.messageId 
    };
  } catch (error: any) {
    console.error("❌ Email send failed:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Verify transporter configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log("✅ Gmail SMTP configuration is valid");
    return true;
  } catch (error: any) {
    console.error("❌ Gmail SMTP configuration error:", error.message);
    return false;
  }
}