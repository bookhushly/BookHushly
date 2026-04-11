// supabase/functions/send-auth-email/templates.ts
// HTML email templates for Supabase auth hooks.
// Logo is served from the production domain so it works in all email clients.

const LOGO_URL = "https://www.bookhushly.com/logo.png";
const BRAND_PURPLE = "#7c3aed";
const BRAND_DARK = "#1f2937";
const YEAR = new Date().getFullYear();

function layout(title: string, previewText: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- preview text (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&#8199;&zwnj;&nbsp;&#8199;&zwnj;&nbsp;&#8199;&zwnj;&nbsp;&#8199;&zwnj;</span>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:${BRAND_PURPLE};padding:28px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="Bookhushly" width="160" height="auto"
                   style="display:block;margin:0 auto;max-width:160px;height:auto;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#6b7280;font-size:12px;">
                You're receiving this email because an action was taken on your Bookhushly account.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                &copy; ${YEAR} Bookhushly &mdash; Made with love for Africa &mdash;
                <a href="mailto:support@bookhushly.com" style="color:${BRAND_PURPLE};text-decoration:none;">support@bookhushly.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:32px auto;">
    <tr>
      <td align="center" style="border-radius:8px;background:${BRAND_PURPLE};">
        <a href="${href}"
           style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;
                  color:#ffffff;text-decoration:none;border-radius:8px;
                  background:${BRAND_PURPLE};mso-padding-alt:14px 32px;"
           target="_blank">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function fallbackLink(href: string): string {
  return `<p style="color:#6b7280;font-size:13px;word-break:break-all;margin:16px 0 0;">
    If the button doesn't work, copy and paste this link into your browser:<br/>
    <a href="${href}" style="color:${BRAND_PURPLE};word-break:break-all;">${href}</a>
  </p>`;
}

// ─── 1. Confirm signup ────────────────────────────────────────────────────────
export function confirmSignupTemplate(confirmUrl: string, userName?: string): { subject: string; html: string } {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  const html = layout(
    "Confirm your Bookhushly account",
    "Tap to confirm your email and start booking.",
    `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${BRAND_DARK};">Confirm your email</h1>
    <p style="margin:0 0 20px;font-size:16px;color:#374151;">${greeting}</p>
    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">
      Thanks for signing up for <strong>Bookhushly</strong> — Nigeria's hospitality & services booking platform.
      Please confirm your email address to activate your account and start booking.
    </p>
    ${ctaButton(confirmUrl, "Confirm Email Address")}
    ${fallbackLink(confirmUrl)}
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
      This link expires in <strong>24 hours</strong>. If you didn't create a Bookhushly account, you can safely ignore this email.
    </p>
    `,
  );
  return { subject: "Confirm your Bookhushly account", html };
}

// ─── 2. Password reset ────────────────────────────────────────────────────────
export function resetPasswordTemplate(resetUrl: string, userName?: string): { subject: string; html: string } {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  const html = layout(
    "Reset your Bookhushly password",
    "We received a request to reset your password.",
    `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${BRAND_DARK};">Reset your password</h1>
    <p style="margin:0 0 20px;font-size:16px;color:#374151;">${greeting}</p>
    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">
      We received a request to reset the password for your Bookhushly account.
      Click the button below to choose a new password.
    </p>
    ${ctaButton(resetUrl, "Reset Password")}
    ${fallbackLink(resetUrl)}
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;padding:14px 16px;margin:24px 0 0;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        <strong>Security notice:</strong> This link expires in <strong>1 hour</strong>.
        If you didn't request a password reset, please ignore this email — your password will not change.
      </p>
    </div>
    `,
  );
  return { subject: "Reset your Bookhushly password", html };
}

// ─── 3. Magic link ────────────────────────────────────────────────────────────
export function magicLinkTemplate(magicUrl: string, userName?: string): { subject: string; html: string } {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  const html = layout(
    "Your Bookhushly sign-in link",
    "Your one-click sign-in link is ready.",
    `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${BRAND_DARK};">Your sign-in link</h1>
    <p style="margin:0 0 20px;font-size:16px;color:#374151;">${greeting}</p>
    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">
      Click the button below to sign in to your Bookhushly account instantly — no password required.
    </p>
    ${ctaButton(magicUrl, "Sign In to Bookhushly")}
    ${fallbackLink(magicUrl)}
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
      This link expires in <strong>1 hour</strong> and can only be used once.
      If you didn't request this, please ignore this email.
    </p>
    `,
  );
  return { subject: "Your Bookhushly sign-in link", html };
}

// ─── 4. Email change confirmation ─────────────────────────────────────────────
export function emailChangeTemplate(confirmUrl: string, newEmail: string, userName?: string): { subject: string; html: string } {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  const html = layout(
    "Confirm your new email address",
    `Confirm that ${newEmail} is your new email.`,
    `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${BRAND_DARK};">Confirm new email address</h1>
    <p style="margin:0 0 20px;font-size:16px;color:#374151;">${greeting}</p>
    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">
      You requested to change your email address to <strong>${newEmail}</strong>.
      Click the button below to confirm this change.
    </p>
    ${ctaButton(confirmUrl, "Confirm New Email")}
    ${fallbackLink(confirmUrl)}
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;padding:14px 16px;margin:24px 0 0;">
      <p style="margin:0;font-size:13px;color:#92400e;">
        If you didn't request this change, please
        <a href="mailto:support@bookhushly.com" style="color:${BRAND_PURPLE};">contact support</a>
        immediately.
      </p>
    </div>
    `,
  );
  return { subject: "Confirm your new Bookhushly email address", html };
}

// ─── 5. Invite ────────────────────────────────────────────────────────────────
export function inviteTemplate(acceptUrl: string, inviterName?: string): { subject: string; html: string } {
  const byLine = inviterName
    ? `You've been invited by <strong>${inviterName}</strong> to join Bookhushly.`
    : "You've been invited to join Bookhushly.";
  const html = layout(
    "You're invited to Bookhushly",
    "Accept your invitation to get started.",
    `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:${BRAND_DARK};">You're invited!</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.7;">${byLine}</p>
    <p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">
      Click the button below to create your account and start using Bookhushly — Nigeria's hospitality & services booking platform.
    </p>
    ${ctaButton(acceptUrl, "Accept Invitation")}
    ${fallbackLink(acceptUrl)}
    <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;">
      This invitation link expires in <strong>24 hours</strong>.
      If you weren't expecting this, you can safely ignore this email.
    </p>
    `,
  );
  return { subject: "You're invited to join Bookhushly", html };
}
