import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Sends a 6-digit verification code in English to the user's email
 * with custom Subject ("Holy Bible & Prayer - Password Reset Verification Code")
 * and custom Footer containing website URL and Google Play Store link.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const code = (body.code || '').trim();

    if (!email || !email.includes('@') || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or 6-digit verification code.' },
        { status: 400 }
      );
    }

    const appNameEn = 'Holy Bible & Prayer';
    const websiteUrl = 'https://kinhthanh.khoahoctamlinh.vn';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kinhthanh.app';

    const subject = `[${appNameEn}] Your Password Reset Code: ${code}`;

    const textMessage = `Hello,

You recently requested to reset the password for your ${appNameEn} account (${email}).

Your 6-digit verification code is:

${code}

Please enter this 6-digit code in the password reset screen along with your new password. This code is valid for 15 minutes.

If you did not request a password reset, please ignore this email.

Warm regards,
The ${appNameEn} Team

--------------------------------------------------
Website: ${websiteUrl}
Download on Google Play (CH Play): ${playStoreUrl}`;

    const htmlMessage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
</head>
<body style="font-family: Georgia, 'Times New Roman', serif; background-color: #faf8f5; margin: 0; padding: 24px; color: #292524;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #1c1917, #451a03, #1c1917); color: #ffffff; padding: 24px; text-align: center;">
      <div style="font-size: 28px; margin-bottom: 6px;">✝️</div>
      <h1 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.3px;">${appNameEn}</h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #fde68a;">Password Reset Verification</p>
    </div>

    <div style="padding: 28px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #44403c;">
      <p style="margin-top: 0;">Hello,</p>
      <p>We received a request to reset the password for your <strong>${appNameEn}</strong> account (<a href="mailto:${email}" style="color: #92400e; text-decoration: none;">${email}</a>).</p>
      <p>Please use the following 6-digit verification code to set your new password:</p>

      <div style="margin: 24px 0; padding: 18px; background-color: #fffbeb; border: 2px dashed #d97706; border-radius: 12px; text-align: center;">
        <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #78350f;">${code}</span>
      </div>

      <p style="font-size: 13px; color: #78716c;">This verification code will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>

      <p style="margin-top: 24px; margin-bottom: 0;">
        Blessings &amp; Peace,<br />
        <strong style="color: #1c1917;">The ${appNameEn} Team</strong>
      </p>
    </div>

    <div style="background-color: #f5f5f4; border-top: 1px solid #e7e5e4; padding: 18px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #57534e; text-align: center; line-height: 1.7;">
      <div>
        🌐 <strong>Official Website:</strong>
        <a href="${websiteUrl}" style="color: #92400e; text-decoration: none; font-weight: 600;">${websiteUrl}</a>
      </div>
      <div style="margin-top: 4px;">
        📱 <strong>Google Play (CH Play):</strong>
        <a href="${playStoreUrl}" style="color: #92400e; text-decoration: none; font-weight: 600;">Download ${appNameEn} for Android</a>
      </div>
    </div>
  </div>
</body>
</html>`;

    let emailSent = false;

    // 1. Send via Nodemailer SMTP (Gmail TLS)
    const smtpUser = process.env.SMTP_USER || 'mevn.net@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'DoomsDay4156';
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 587);

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from: `"${appNameEn}" <${smtpUser}>`,
        to: email,
        subject,
        text: textMessage,
        html: htmlMessage,
      });
      emailSent = true;
    } catch (smtpErr) {
      console.warn('Primary SMTP send warning:', smtpErr);
    }

    // 2. Fallback: Try Resend API if configured
    if (!emailSent && process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${appNameEn} <noreply@khoahoctamlinh.vn>`,
            to: [email],
            subject,
            text: textMessage,
            html: htmlMessage,
          }),
          signal: AbortSignal.timeout(5000),
        });
        if (resendRes.ok) {
          emailSent = true;
        }
      } catch {
        // Ignore
      }
    }

    // 3. Fallback: Ecosystem PHP mailer endpoint
    if (!emailSent) {
      try {
        const ecoRes = await fetch('https://khoahoctamlinh.vn/backend_api/send_otp_mail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject,
            code,
            message: textMessage,
            html: htmlMessage,
            lang: 'en',
          }),
          signal: AbortSignal.timeout(4000),
        });
        if (ecoRes.ok) {
          emailSent = true;
        }
      } catch {
        // Ignore
      }
    }

    return NextResponse.json({
      success: true,
      relaySent: emailSent,
      message: 'Verification code processed.',
    });
  } catch (error) {
    console.error('Send reset code API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
