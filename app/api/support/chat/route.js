import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { trackAIUsage } from "@/lib/track-ai-usage";

// In-memory rate limiting: sessionId/userId → { count, resetAt }
const rateLimitStore = new Map();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(key) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false; // not limited
  }
  if (entry.count >= RATE_LIMIT_MAX) return true; // limited
  entry.count++;
  return false;
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, "").trim();
}

const SYSTEM_PROMPT = `
You are the BookHushly Support Assistant — helpful, warm, and concise.
BookHushly (bookhushly.com) is Nigeria's premier hospitality and services booking platform owned by Longman Vicky & Co Ltd.

SERVICES:
- Hotels: browse and book rooms. Vendor-managed listings.
- Serviced Apartments: short or extended stays. Vendor-managed.
- Events: venues and event services. Vendor-managed.
- Logistics: quote-based. BookHushly-managed directly.
- Security Services: quote-based. BookHushly-managed directly.

BOOKING FLOW:
Hotels/Apartments/Events: Browse → Select → Pick dates → Pay → Confirmation email.
Logistics/Security: Submit quote request → BookHushly contacts you → Pay after approval.

PAYMENTS:
- Nigerian Naira (NGN) via Paystack (card, bank transfer, USSD)
- Cryptocurrency via NOWPayments
- BookHushly never stores card details

ACCOUNTS:
- Free customer accounts: manage bookings, wallet (NGN credit), profile
- Vendor accounts: apply at bookhushly.com, KYC required (NIN + CAC), manage via vendor dashboard

ESCALATION RULES:
- If user is frustrated, repeating themselves, or asks for a human: proactively offer escalation
- If you cannot answer with confidence: say so honestly, offer human escalation — never guess on prices or booking specifics
- You have no access to live booking data or user account details — direct those queries to a human agent

TONE: Warm, professional, concise. Acknowledge Nigerian network and payment challenges with empathy. Never fabricate prices or booking details.
`;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { reply: "Something went wrong. Please try again.", error: true },
        { status: 200 }
      );
    }

    const { messages, conversationId, userId, sessionId } = body;

    // Validate
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { reply: "Something went wrong. Please try again.", error: true },
        { status: 200 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { reply: "Something went wrong. Please try again.", error: true },
        { status: 200 }
      );
    }

    // Rate limit by userId (authenticated) or sessionId (guest)
    const rateLimitKey = userId || sessionId;
    const limited = checkRateLimit(rateLimitKey);
    if (limited) {
      return NextResponse.json({
        reply:
          "You've reached the message limit. Please try again in an hour or speak with a human agent.",
        limitReached: true,
      });
    }

    // Sanitise the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json(
        { reply: "Something went wrong. Please try again.", error: true },
        { status: 200 }
      );
    }

    const rawContent = String(lastMessage.content || "");
    const sanitised = stripHtml(rawContent).slice(0, 500);

    if (!sanitised) {
      return NextResponse.json(
        { reply: "Something went wrong. Please try again.", error: true },
        { status: 200 }
      );
    }

    const supabase = await createClient();

    // Resolve or create conversation
    let convId = conversationId || null;

    if (!convId) {
      // Get current user if authenticated
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const { data: conv, error: convError } = await supabase
        .from("support_conversations")
        .insert({
          user_id: authUser?.id || null,
          session_id: sessionId,
          status: "bot",
        })
        .select("id")
        .single();

      if (convError || !conv) {
        // Continue without DB persistence — never block the user
        console.error("Failed to create conversation:", convError);
      } else {
        convId = conv.id;
      }
    }

    // Insert user message (best-effort)
    if (convId) {
      const { error: msgError } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: convId,
          role: "user",
          content: sanitised,
          status: "sent",
        });
      if (msgError) {
        console.error("Failed to insert user message:", msgError);
      }
    }

    // Build message history for Anthropic (sanitise all entries)
    const anthropicMessages = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: stripHtml(String(m.content || "")).slice(0, 500),
    }));

    // Ensure last message is correct
    anthropicMessages[anthropicMessages.length - 1] = {
      role: "user",
      content: sanitised,
    };

    // Call Anthropic with timeout
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    let reply;
    try {
      const response = await anthropic.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages: anthropicMessages,
        },
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      reply =
        response.content?.[0]?.text ||
        "I couldn't generate a response. Please try again.";
    } catch (anthropicErr) {
      clearTimeout(timeoutId);
      if (anthropicErr.name === "AbortError" || anthropicErr.code === "ERR_ABORTED") {
        return NextResponse.json({
          reply: "The response took too long. Please try again.",
          timeout: true,
          conversationId: convId,
        });
      }
      console.error("Anthropic error:", anthropicErr);
      return NextResponse.json({
        reply:
          "Our AI assistant is temporarily unavailable. You can still talk to a human agent.",
        error: true,
        conversationId: convId,
      });
    }

    // Insert assistant response (best-effort)
    if (convId) {
      const { error: assistantMsgError } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: convId,
          role: "assistant",
          content: reply,
          status: "sent",
        });
      if (assistantMsgError) {
        console.error("Failed to insert assistant message:", assistantMsgError);
      }
    }

    trackAIUsage("support_chat", userId ?? null);
    return NextResponse.json({ reply, conversationId: convId });
  } catch (err) {
    console.error("Support chat route error:", err);
    return NextResponse.json({
      reply: "Something went wrong. Please try again.",
      error: true,
    });
  }
}
