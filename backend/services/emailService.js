import nodemailer from "nodemailer";
import { BACKEND_BASE_URL, SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM } from "../config.js";

function getEmailConfig() {
  return {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: EMAIL_FROM
  };
}

function createTransporter() {
  const config = getEmailConfig();

  if (!config.host || !config.user || !config.pass || !config.from) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

export function buildVerificationLink(token) {
  const baseUrl = String(BACKEND_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
  return `${baseUrl}/verify/${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail(user) {
  const transporter = createTransporter();
  const verificationLink = buildVerificationLink(user.verificationToken);

  if (!transporter) {
    return verificationLink;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: "Verify your email",
      html: `
        <p>Hello ${user.name || "there"},</p>
        <p>Thanks for signing up. Click the link below to verify your email:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>If you did not create this account, you can ignore this email.</p>
      `
    });
  } catch (err) {
    console.warn("Email delivery skipped:", err.message || err);
  }

  return verificationLink;
}
