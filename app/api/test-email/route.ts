import { NextRequest, NextResponse } from "next/server";
import { sendEmail, verifyEmailConfig } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing Gmail SMTP...");

    // Verify configuration first
    const isValid = await verifyEmailConfig();
    if (!isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: "Gmail SMTP configuration is invalid. Check your credentials." 
        },
        { status: 500 }
      );
    }

    // Send test email
    const result = await sendEmail({
      to: "srinathmpro2001@gmail.com", // Your test email
      subject: "🧪 Test Email from ChurnGuard (Gmail SMTP)",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #3b82f6;">Hello from ChurnGuard!</h1>
          <p>If you receive this email, Gmail SMTP is working perfectly! ✅</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Service: Gmail SMTP</li>
            <li>From: ${process.env.GMAIL_USER}</li>
            <li>Time: ${new Date().toLocaleString()}</li>
          </ul>
          <p>You can now send emails to any address! 🎉</p>
        </div>
      `,
    });
    
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: result.messageId,
      sentTo: "srinathmpro2001@gmail.com",
    });
  } catch (error: any) {
    console.error("❌ Test email failed:", error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}