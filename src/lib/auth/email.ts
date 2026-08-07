import { ApiError } from "@/lib/http";

type EmailMessage = { to: string; subject: string; html: string };

export async function sendTransactionalEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") throw new ApiError(500, "Email service is not configured.", "EMAIL_NOT_CONFIGURED");
    console.info("Development email", { to: message.to, subject: message.subject, html: message.html });
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, ...message }),
  });
  if (!response.ok) throw new ApiError(502, "Unable to send email.", "EMAIL_DELIVERY_FAILED");
}

export function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL;
  if (!base) throw new Error("NEXT_PUBLIC_APP_URL or AUTH_URL is required.");
  return new URL(path, base).toString();
}
