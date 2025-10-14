import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { MAIL_USER, MAIL_PASS, MAIL_RECIPIENT } from "@/lib/constants/env";

interface EcommerceContactForm {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: EcommerceContactForm = await request.json();
    const { name, email, phone, category, message } = body;

    // Validate required fields
    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: "Name, email, category and message are required." },
        { status: 400 }
      );
    }

    if (!MAIL_USER || !MAIL_PASS || !MAIL_RECIPIENT) {
      return NextResponse.json(
        { error: "Missing email configuration on server." },
        { status: 500 }
      );
    }

    // Load & compile Handlebars template
    const templatePath = path.join(
      process.cwd(),
      "templates",
      "email-template.hbs"
    );
    const source = fs.readFileSync(templatePath, "utf8");
    const compileTemplate = handlebars.compile(source);
    const html = compileTemplate({ name, email, phone, category, message });

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: MAIL_USER, pass: MAIL_PASS },
      tls: { rejectUnauthorized: false },
    });

    // Send mail
    await transporter.sendMail({
      from: `" Contact" <${MAIL_USER}>`,
      to: MAIL_RECIPIENT,
      subject: `New Contact Request from ${name}`,
      html,
    });

    return NextResponse.json({ message: "Email sent successfully." });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Email failed to send." },
      { status: 500 }
    );
  }
}
