// TASK 3 — CONTACT FORM EMAIL + LOCATION TEXT — DONE 2026-07-07
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Only send email if RESEND_API_KEY is configured in .env.local
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      // Lazy import so the module doesn't crash at build time
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);

      await resend.emails.send({
        from:    "Attention to Shine <onboarding@resend.dev>",
        // All contact form submissions go directly to the business owner.
        // Intentionally not overridable by CONTACT_EMAIL.
        to:      "lilliechris06@gmail.com",
        replyTo: email,
        subject: subject
          ? `[Attention to Shine] ${subject} — from ${name}`
          : `[Attention to Shine] New message from ${name}`,
        text: [
          `Name:    ${name}`,
          `Email:   ${email}`,
          phone   ? `Phone:   ${phone}`   : "",
          subject ? `Subject: ${subject}` : "",
          "",
          message,
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } else {
      // No key yet — log to console so you can see submissions during development
      console.log("📬 Contact form submission (RESEND_API_KEY not set):", {
        name, email, phone, subject, message,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact route error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
