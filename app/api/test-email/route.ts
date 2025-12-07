import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing email...");
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: "srinath2411.mani@gmail.com", // ✅ Your Resend signup email
      subject: "🧪 Test Email from ChurnGuard",
      html: `
        <h1>Hello!</h1>
        <p>If you receive this, email is working! ✅</p>
        <p><strong>This email was sent to your Resend verified address:</strong> srinath2411.mani@gmail.com</p>
      `,
    });

    if (error) {
      console.error("❌ Error:", error);
      return NextResponse.json(
        { success: false, error: error.message || error },
        { status: 500 }
      );
    }

    console.log("✅ Email sent! ID:", data?.id);
    
    return NextResponse.json({
      success: true,
      message: "Email sent to srinath2411.mani@gmail.com",
      emailId: data?.id,
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}