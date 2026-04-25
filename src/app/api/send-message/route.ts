import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function contactEmailHtml(body: string, fromName: string, toName: string): string {
  const safeBody = escapeHtml(body).replace(/\n/g, "<br />");
  const safeFrom = escapeHtml(fromName);
  const safeTo = escapeHtml(toName);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:24px;background:#f4f4f5;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;">
    <tr>
      <td style="background:#ffffff;border-radius:12px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);border:1px solid #e4e4e7;">
        <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;font-family:system-ui,sans-serif;">
          Fr. Conceicao Rodrigues College of Engineering
        </p>
        <p style="margin:0 0 8px;font-size:13px;color:#3f3f46;font-family:system-ui,sans-serif;">
          Message for <strong>${safeTo}</strong>
        </p>
        <div style="margin:16px 0;padding:16px;background:#fafafa;border-radius:8px;border-left:3px solid #2563eb;font-size:14px;line-height:1.6;color:#18181b;font-family:system-ui,sans-serif;">
          ${safeBody}
        </div>
        <p style="margin:20px 0 0;font-size:13px;color:#52525b;font-family:system-ui,sans-serif;">
          — <strong>${safeFrom}</strong>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function adminEmailHtml(body: string): string {
  const safeBody = escapeHtml(body).replace(/\n/g, "<br />");
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;">
    <tr>
      <td style="background:#0f172a;padding:20px 24px;border-radius:12px 12px 0 0;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">FPMP</p>
        <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#94a3b8;">
          Faculty Profile Management
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#ffffff;padding:28px 24px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
        <div style="font-size:15px;line-height:1.65;color:#1e293b;">
          ${safeBody}
        </div>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:16px 24px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
        <p style="margin:0;font-size:11px;color:#64748b;text-align:center;">
          Admin notice · Fr. Conceicao Rodrigues College of Engineering
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: RESEND_API_KEY is not set." },
        { status: 500 },
      );
    }
    if (!fromEmail) {
      return NextResponse.json(
        { error: "Server configuration error: RESEND_FROM_EMAIL is not set." },
        { status: 500 },
      );
    }

    const payload = await request.json();
    const { to, toName, fromName, subject, body: messageBody, type, senderEmail } = payload as Record<string, string | undefined>;

    const missingFields = [];
    if (!to) missingFields.push("to");
    if (!toName) missingFields.push("toName");
    if (!fromName) missingFields.push("fromName");
    if (!subject) missingFields.push("subject");
    if (!messageBody) missingFields.push("body");
    if (!type) missingFields.push("type");

    if (missingFields.length > 0) {
      console.error("Missing fields in send-message request:", missingFields, payload);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")} are required.` },
        { status: 400 },
      );
    }

    // Now we know they exist, cast them for TypeScript
    const validatedTo = to as string;
    const validatedToName = toName as string;
    const validatedFromName = fromName as string;
    const validatedSubject = subject as string;
    const validatedBody = messageBody as string;
    const validatedType = type as string;

    if (validatedType !== "contact" && validatedType !== "admin") {
      return NextResponse.json(
        { error: "Invalid type: must be 'contact' or 'admin'." },
        { status: 400 },
      );
    }

    const resend = new Resend(apiKey);
    const supabase = await createSupabaseServerClient();

    let emailSubject: string;
    let html: string;

    if (validatedType === "contact") {
      emailSubject = "[FPMP] " + validatedSubject;
      html = contactEmailHtml(validatedBody, validatedFromName, validatedToName);
      
      // Save to database for faculty inbox
      const { data: profile } = await supabase
        .from('faculty_profiles')
        .select('id')
        .eq('email', validatedTo)
        .maybeSingle();

      if (profile) {
        await supabase.from('messages').insert({
          from_admin: false,
          to_faculty: profile.id,
          subject: validatedSubject,
          body: `From: ${validatedFromName}\n\n${validatedBody}`,
        });
      }
    } else {
      emailSubject = "[Admin Notice] " + validatedSubject;
      html = adminEmailHtml(validatedBody);
    }

    const { data, error } = await resend.emails.send({
      from: `FPMP Portal <${fromEmail}>`,
      to: validatedTo,
      reply_to: senderEmail,
      subject: emailSubject,
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
