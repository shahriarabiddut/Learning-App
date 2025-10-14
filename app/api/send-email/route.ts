import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail/mailer";

export async function POST(req: NextRequest) {
  try {
    const { type, email, url, subject, html } = await req.json();

    if (!type || !email) {
      return NextResponse.json(
        { error: "Type and email are required" },
        { status: 400 }
      );
    }

    await sendEmail(type, { email, url, subject, html });

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
