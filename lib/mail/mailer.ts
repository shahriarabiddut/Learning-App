import nodemailer from "nodemailer";
import {
  MAIL_PASS,
  MAIL_USER,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SITE_NAME,
  SENDER_NAME,
  SENDER_EMAIL,
} from "@/lib/constants/env";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: SMTP_SECURE === "true",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ignore self-signed cert
  },
});

type EmailType = "reset-password" | "verify-email" | "welcome" | "custom";

interface EmailOptions {
  email: string;
  url?: string;
  subject?: string;
  html?: string;
}

export async function sendEmail(type: EmailType, options: EmailOptions) {
  let subject = "";
  let html = "";

  switch (type) {
    case "reset-password":
      subject = options.subject || "Reset Your Password";
      html =
        options.html ||
        `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${options.url}" 
             style="display: inline-block; padding: 10px 20px; margin: 20px 0; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
           <p style="font-size: 16px; color: #888;">
              !! If you did not request this, please ignore this email. !! No Need To Reply!
            </p>
        </div>
      `;
      break;

    case "verify-email":
      subject = options.subject || `Verify your Email | ${SITE_NAME}`;
      html =
        options.html ||
        `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #333;">Verify Your Email Address</h2>
                <p style="font-size: 16px; color: #555;">
                  Click the button below to confirm that you used this email address to create an account on ${SITE_NAME} :
                </p>
                <a href="${options.url}" 
                  style="display: inline-block; padding: 12px 24px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                  Confirm My Email
                </a>
                <p style="font-size: 16px; color: #888;">
                  !! If you did not request this, please ignore this email. !! No Need To Reply!
                </p>
              </div>
      `;
      break;

    case "welcome":
      subject = `Welcome to ${SITE_NAME}`;
      html = `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>Welcome to ${SITE_NAME}!</h2>
          <p>We're excited to have you on board.</p>
          <p>Enjoy exploring our platform.</p>
        </div>
      `;
      break;

    case "custom":
      if (!options.subject || !options.html) {
        throw new Error("Custom emails require both subject and HTML content.");
      }
      subject = options.subject;
      html = options.html;
      break;

    default:
      throw new Error("Invalid email type.");
  }

  const mailOptions = {
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: options.email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}
