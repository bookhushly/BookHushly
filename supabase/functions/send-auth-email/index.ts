// supabase/functions/send-auth-email/index.ts
// Supabase Auth Hook — Send Email
//
// Registered in the Supabase Dashboard under:
//   Authentication → Hooks → Send Email Hook → Supabase Edge Functions
//
// Required secrets (set via `supabase secrets set` or Dashboard):
//   RESEND_API_KEY   — your Resend API key
//   SITE_URL         — e.g. https://www.bookhushly.com
//   HOOK_SECRET      — the signing secret Supabase shows when you register the hook

import { Webhook } from "npm:svix@1.21.0";
import {
  confirmSignupTemplate,
  resetPasswordTemplate,
  magicLinkTemplate,
  emailChangeTemplate,
  inviteTemplate,
} from "./templates.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

interface EmailData {
  /** The action type Supabase is asking us to handle */
  email_action_type: "signup" | "recovery" | "magiclink" | "email_change" | "invite";
  /** Token hash — use to build the verification URL */
  token_hash: string;
  /** Where to redirect after the user clicks the link */
  redirect_to: string;
  /** Your site's base URL as configured in Supabase Auth */
  site_url: string;
  /** OTP / one-time token (6-digit code, available for OTP flows) */
  token?: string;
  /** For email_change — the new email address */
  token_hash_new?: string;
  token_new?: string;
}

interface HookPayload {
  user: AuthUser;
  email_data: EmailData;
}

// ─── Helper: build the Supabase verification URL ─────────────────────────────

function buildVerifyUrl(siteUrl: string, tokenHash: string, type: string, redirectTo: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
    next: redirectTo || "/",
  });
  return `${base}/auth/confirm?${params.toString()}`;
}

// ─── Helper: send via Resend REST API ────────────────────────────────────────
// We call the Resend API directly with fetch so the function works in Deno
// without any Node.js compatibility shims.

async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
  resendApiKey: string;
}): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Bookhushly <noreply@bookhushly.com>",
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error ${response.status}: ${body}`);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Supabase sends a POST with the hook payload
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Read body as text first so we can verify the Svix signature
  const bodyText = await req.text();

  // Verify the Svix webhook signature (v1,whsec_... secret format)
  const hookSecret = Deno.env.get("HOOK_SECRET");
  if (hookSecret) {
    const wh = new Webhook(hookSecret);
    try {
      wh.verify(bodyText, Object.fromEntries(req.headers));
    } catch (err) {
      console.error("Hook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY is not set");
    return new Response("Email service not configured", { status: 500 });
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "https://www.bookhushly.com";

  let payload: HookPayload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { user, email_data } = payload;
  const userName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    undefined;

  const { email_action_type, token_hash, redirect_to } = email_data;

  try {
    let subject: string;
    let html: string;

    switch (email_action_type) {
      case "signup": {
        const confirmUrl = buildVerifyUrl(siteUrl, token_hash, "signup", redirect_to);
        ({ subject, html } = confirmSignupTemplate(confirmUrl, userName));
        break;
      }

      case "recovery": {
        const resetUrl = buildVerifyUrl(siteUrl, token_hash, "recovery", redirect_to);
        ({ subject, html } = resetPasswordTemplate(resetUrl, userName));
        break;
      }

      case "magiclink": {
        const magicUrl = buildVerifyUrl(siteUrl, token_hash, "magiclink", redirect_to);
        ({ subject, html } = magicLinkTemplate(magicUrl, userName));
        break;
      }

      case "email_change": {
        // Supabase sends two token hashes for email change; we verify the new address
        const newTokenHash = email_data.token_hash_new ?? token_hash;
        const confirmUrl = buildVerifyUrl(siteUrl, newTokenHash, "email_change", redirect_to);
        // The new email is in user.email for the "new" side of the email change
        ({ subject, html } = emailChangeTemplate(confirmUrl, user.email, userName));
        break;
      }

      case "invite": {
        const acceptUrl = buildVerifyUrl(siteUrl, token_hash, "invite", redirect_to);
        ({ subject, html } = inviteTemplate(acceptUrl));
        break;
      }

      default: {
        console.warn(`Unhandled email_action_type: ${email_action_type}`);
        // Return 200 so Supabase doesn't retry — it will fall back to its own email
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    await sendViaResend({ to: user.email, subject, html, resendApiKey });

    console.log(`Auth email sent: type=${email_action_type} to=${user.email}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to send auth email:", err);
    // Return 500 so Supabase knows the email was not delivered
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
