"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  ArrowUp,
  RefreshCw,
  User,
  Minus,
  Phone,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────
const GREETING =
  "Hi! I'm the BookHushly assistant. Ask me anything about bookings, payments, or our services.";
const MAX_CHARS = 500;
const CHAR_WARN = 400;
const CHAR_DANGER = 480;
const MAX_RETRIES = 3;
const SEND_TIMEOUT_MS = 15000;

// ─── Sub-components ───────────────────────────────────────────────────────────

function BotAvatar({ size = "sm" }) {
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const icon = size === "sm" ? 12 : 16;
  return (
    <div
      className={cn(
        dim,
        "rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0 shadow-sm"
      )}
    >
      <User size={icon} className="text-white" />
    </div>
  );
}

function AgentAvatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AG";
  return (
    <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold shadow-sm">
      {initials}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-start gap-2 mb-4">
      <BotAvatar />
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full block"
              style={{
                animation: `typing 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onRetry, agentName }) {
  if (msg.role === "user") {
    const isFailed = msg.status === "failed";
    const isSendingMsg = msg.status === "sending";
    return (
      <div
        className="flex justify-end mb-4"
        style={{ animation: "messageIn 0.18s ease-out" }}
      >
        <div className="max-w-[72%] flex flex-col items-end gap-1">
          <div
            className={cn(
              "px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed shadow-sm",
              isFailed
                ? "bg-red-50 text-red-700 ring-2 ring-red-100"
                : "bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-md"
            )}
          >
            {msg.content}
          </div>
          <div className="flex items-center gap-2 pr-1">
            {isSendingMsg && (
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"
                  style={{ animation: "pulse 1s ease-in-out infinite" }}
                />
                Sending
              </span>
            )}
            {isFailed && (
              <button
                onClick={() => onRetry(msg)}
                className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 font-medium"
              >
                <RefreshCw size={10} />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (msg.role === "assistant") {
    return (
      <div
        className="flex items-start gap-2 mb-4"
        style={{ animation: "messageIn 0.18s ease-out" }}
      >
        <BotAvatar />
        <div className="max-w-[72%] bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "agent") {
    return (
      <div
        className="flex items-start gap-2 mb-4"
        style={{ animation: "messageIn 0.18s ease-out" }}
      >
        <AgentAvatar name={agentName} />
        <div className="max-w-[72%]">
          <p className="text-[11px] font-medium text-gray-500 mb-1 ml-0.5 uppercase tracking-wide">
            {agentName || "Agent"}
          </p>
          <div className="bg-violet-50 border-l-[3px] border-violet-400 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [handoffStatus, setHandoffStatus] = useState("bot");
  const [agentName, setAgentName] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showHandoffDialog, setShowHandoffDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [realtimeStatus, setRealtimeStatus] = useState("idle");
  const [timeoutMsg, setTimeoutMsg] = useState(false);

  // Refs
  const isSending = useRef(false);
  const messageQueue = useRef([]);
  const sessionId = useRef(null);
  const messagesEndRef = useRef(null);
  const conversationIdRef = useRef(null);
  const messagesRef = useRef([]);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const channelRef = useRef(null);
  const convChannelRef = useRef(null);
  const abortControllerRef = useRef(null);

  const supabase = createClient();

  // Sync refs
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Online / offline
  useEffect(() => {
    const online = () => {
      setIsOnline(true);
      messagesRef.current
        .filter((m) => m.status === "failed")
        .forEach((m) => retryMessage(m));
    };
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  // Mount: session + conversation
  useEffect(() => {
    let sid = localStorage.getItem("bh_session_id");
    if (!sid) { sid = crypto.randomUUID(); localStorage.setItem("bh_session_id", sid); }
    sessionId.current = sid;

    const savedConvId = localStorage.getItem("bh_conversation_id");
    if (savedConvId) { setConversationId(savedConvId); conversationIdRef.current = savedConvId; }
  }, []);

  // Fetch history on open
  useEffect(() => {
    if (isOpen && conversationIdRef.current && messages.length === 0) {
      fetchHistory(conversationIdRef.current);
    }
  }, [isOpen]);

  // Realtime on conversation
  useEffect(() => {
    if (!conversationId) return;
    setupRealtime(conversationId);
    return () => teardownRealtime();
  }, [conversationId]);

  // ── Data helpers ──────────────────────────────────────────────────────────

  const fetchHistory = async (convId) => {
    try {
      const { data: conv } = await supabase
        .from("support_conversations")
        .select("status, assigned_to")
        .eq("id", convId)
        .single();
      if (conv) {
        setHandoffStatus(conv.status);
        if (conv.assigned_to) fetchAgentName(conv.assigned_to);
      }
      const { data: msgs } = await supabase
        .from("support_messages")
        .select("id, role, content, status, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      if (msgs?.length) {
        setMessages(msgs.map((m) => ({ id: m.id, role: m.role, content: m.content, status: m.status || "sent", timestamp: m.created_at })));
      }
    } catch (err) { console.error("fetchHistory:", err); }
  }

  const fetchAgentName = async (assignedTo) => {
    const { data } = await supabase.from("users").select("name").eq("id", assignedTo).single();
    setAgentName(data?.name || null);
  }

  // ── Realtime ──────────────────────────────────────────────────────────────

  const setupRealtime = (convId) => {
    teardownRealtime();

    const msgCh = supabase
      .channel(`widget-msgs-${convId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `conversation_id=eq.${convId}` }, (p) => {
        const msg = p.new;
        if (msg.role !== "user") {
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            if (!isOpen) setUnreadCount((c) => c + 1);
            return [...prev, { id: msg.id, role: msg.role, content: msg.content, status: "sent", timestamp: msg.created_at }];
          });
        }
      })
      .subscribe((s) => {
        if (s === "SUBSCRIBED") { setRealtimeStatus("connected"); reconnectAttemptsRef.current = 0; }
        if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") { setRealtimeStatus("reconnecting"); scheduleReconnect(convId); }
      });

    const convCh = supabase
      .channel(`widget-conv-${convId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "support_conversations", filter: `id=eq.${convId}` }, (p) => {
        const u = p.new;
        setHandoffStatus(u.status);
        if (u.assigned_to && u.status === "active_human") fetchAgentName(u.assigned_to);
        if (u.status === "resolved") {
          localStorage.removeItem("bh_conversation_id");
          conversationIdRef.current = null;
          setConversationId(null);
        }
      })
      .subscribe();

    channelRef.current = msgCh;
    convChannelRef.current = convCh;
  }

  const teardownRealtime = () => {
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    if (convChannelRef.current) { supabase.removeChannel(convChannelRef.current); convChannelRef.current = null; }
    clearTimeout(reconnectTimerRef.current);
  }

  const scheduleReconnect = (convId) => {
    if (reconnectAttemptsRef.current >= 5) { setRealtimeStatus("failed"); return; }
    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => { reconnectAttemptsRef.current++; setupRealtime(convId); }, 5000);
  }

  // ── Send logic ────────────────────────────────────────────────────────────

  const sendMessage = async (content) => {
    if (!content || isSending.current || !isOnline) return;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;

    const msgId = crypto.randomUUID();
    isSending.current = true;
    setInputValue(""); setCharCount(0); setTimeoutMsg(false);

    messageQueue.current.push({ id: msgId, content: trimmed, timestamp: Date.now(), retries: 0 });
    setMessages((prev) => [...prev, { id: msgId, role: "user", content: trimmed, status: "sending", timestamp: new Date().toISOString() }]);
    setIsTyping(true);

    let success = false, retries = 0;

    while (!success && retries <= MAX_RETRIES) {
      if (retries > 0) await new Promise((r) => setTimeout(r, Math.pow(2, retries - 1) * 500));

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const tid = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

        const history = messagesRef.current
          .filter((m) => m.status !== "failed" && m.id !== msgId)
          .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));
        history.push({ role: "user", content: trimmed });

        const res = await fetch("/api/support/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, conversationId: conversationIdRef.current, sessionId: sessionId.current }),
          signal: controller.signal,
        });

        clearTimeout(tid);
        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();
        success = true;

        setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: "sent" } : m));

        if (data.conversationId && !conversationIdRef.current) {
          conversationIdRef.current = data.conversationId;
          setConversationId(data.conversationId);
          localStorage.setItem("bh_conversation_id", data.conversationId);
        }

        if (data.reply) {
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: data.reply, status: "sent", timestamp: new Date().toISOString() }]);
        }

        if (data.timeout) setTimeoutMsg(true);
        messageQueue.current = messageQueue.current.filter((q) => q.id !== msgId);

      } catch (err) {
        if (err.name === "AbortError") {
          setIsTyping(false); isSending.current = false; setTimeoutMsg(true);
          setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: "failed" } : m));
          messageQueue.current = messageQueue.current.filter((q) => q.id !== msgId);
          return;
        }
        retries++;
        if (retries > MAX_RETRIES) {
          setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, status: "failed" } : m));
          messageQueue.current = messageQueue.current.map((q) => q.id === msgId ? { ...q, failed: true } : q);
        }
      }
    }

    setIsTyping(false);
    isSending.current = false;
  }

  const retryMessage = (msg) => {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    messageQueue.current = messageQueue.current.filter((q) => q.id !== msg.id);
    sendMessage(msg.content);
  }

  const handleHandoffConfirm = async () => {
    setShowHandoffDialog(false);
    if (!conversationIdRef.current) { await sendMessage("I'd like to speak with a human agent."); return; }
    try {
      await supabase.from("support_conversations").update({ status: "pending_human" }).eq("id", conversationIdRef.current);
      setHandoffStatus("pending_human");
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: "assistant",
        content: "You've been added to the queue. An agent will join shortly — your conversation history is preserved.",
        status: "sent", timestamp: new Date().toISOString(),
      }]);
    } catch (err) { console.error("Handoff:", err); }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const isPendingHuman = handoffStatus === "pending_human";
  const isActiveHuman = handoffStatus === "active_human";
  const isEmpty = messages.length === 0;

  const panelClass = isMobile
    ? "fixed inset-0 z-50 flex flex-col"
    : "fixed bottom-[88px] right-5 z-50 w-[400px] h-[580px] flex flex-col rounded-2xl overflow-hidden";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        @keyframes widgetPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(124, 58, 237, 0); }
        }
      `}</style>

      {/* ── Floating button ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(109,40,217,0.35)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setIsOpen(true); setUnreadCount(0); }}
            style={unreadCount > 0 ? { animation: "widgetPulse 2s ease-in-out infinite" } : {}}
            className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-gradient-to-br from-violet-600 to-violet-700 rounded-full shadow-lg flex items-center justify-center transition-colors"
            aria-label="Open support chat"
          >
            <MessageCircle size={22} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 ring-2 ring-white rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ y: 16, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(panelClass, "bg-white shadow-2xl border border-gray-100/80")}
          >
            {/* ── Header ── */}
            <div className="flex-shrink-0 bg-gradient-to-br from-violet-700 via-violet-600 to-violet-800 px-5 py-4">
              {/* Offline banner */}
              {!isOnline && (
                <div className="mb-3 -mx-5 -mt-4 px-4 py-2 bg-amber-500/90 text-white text-xs font-medium text-center">
                  You're offline. Messages will send when you reconnect.
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                {/* Brand + status */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm leading-tight">
                        BookHushly Support
                      </p>
                    </div>
                    {/* Status line */}
                    {!isPendingHuman && !isActiveHuman && (
                      <p className="text-violet-200 text-xs mt-0.5">
                        Typically replies instantly
                      </p>
                    )}
                    {isPendingHuman && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full mt-1 font-medium">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" style={{ animation: "pulse 1s ease-in-out infinite" }} />
                        Waiting for agent…
                      </span>
                    )}
                    {isActiveHuman && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-green-400/20 text-green-200 px-2 py-0.5 rounded-full mt-1 font-medium">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        {agentName ? `Chatting with ${agentName}` : "Agent joined"}
                      </span>
                    )}
                    {realtimeStatus === "reconnecting" && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full mt-1">
                        Reconnecting…
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 mt-0.5">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Minimise"
                  >
                    <Minus size={14} className="text-white" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── System banners ── */}
            {realtimeStatus === "failed" && (
              <div className="flex-shrink-0 px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 flex items-center justify-between">
                <span>Live updates paused.</span>
                <button onClick={() => window.location.reload()} className="underline font-medium ml-2">
                  Refresh
                </button>
              </div>
            )}

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-0">
              {/* Greeting bubble — always shown */}
              <div className="flex items-start gap-2 mb-4">
                <BotAvatar />
                <div className="max-w-[72%] bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
                  {GREETING}
                </div>
              </div>

              {/* Empty state (no prior messages) */}
              {isEmpty && !isTyping && (
                <div className="flex flex-col items-center justify-center py-8 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                    <User size={24} className="text-violet-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1.5">
                    How can we help?
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-5">
                    Ask about bookings, payments, vendors, or anything else.
                  </p>
                  {/* Quick prompts */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {["How do I book a hotel?", "Payment methods?", "Track my booking"].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setInputValue(q); setCharCount(q.length); }}
                        className="text-xs bg-gray-100 hover:bg-violet-50 hover:text-violet-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors border border-gray-200 hover:border-violet-200"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onRetry={retryMessage}
                  agentName={agentName}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && <TypingDots />}

              {/* Timeout state */}
              {timeoutMsg && (
                <div
                  className="flex items-start gap-2 mb-4"
                  style={{ animation: "messageIn 0.18s ease-out" }}
                >
                  <BotAvatar />
                  <div className="max-w-[72%] bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
                    <p className="mb-2">Taking longer than usual…</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { abortControllerRef.current?.abort(); setIsTyping(false); setTimeoutMsg(false); isSending.current = false; }}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setTimeoutMsg(false);
                          const last = messagesRef.current.filter((m) => m.role === "user").at(-1);
                          if (last) retryMessage(last);
                        }}
                        className="text-xs text-violet-600 hover:text-violet-700 font-medium underline"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input bar ── */}
            <div
              className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-3 pb-3"
              style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
            >
              <div
                className={cn(
                  "flex items-end gap-2 bg-gray-50 rounded-2xl border transition-all duration-150 px-4 py-2.5",
                  isOnline
                    ? "border-gray-200 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100"
                    : "opacity-50 pointer-events-none border-gray-200"
                )}
              >
                <textarea
                  value={inputValue}
                  onChange={(e) => {
                    if (e.target.value.length > MAX_CHARS) return;
                    setInputValue(e.target.value);
                    setCharCount(e.target.value.length);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
                  }}
                  placeholder="Message…"
                  rows={1}
                  disabled={!isOnline}
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none outline-none leading-relaxed"
                  style={{ maxHeight: "100px" }}
                />
                {charCount >= CHAR_WARN && (
                  <span
                    className={cn(
                      "flex-shrink-0 text-[11px] tabular-nums font-medium",
                      charCount >= CHAR_DANGER ? "text-red-500" : "text-amber-500"
                    )}
                  >
                    {MAX_CHARS - charCount}
                  </span>
                )}
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping || !isOnline}
                  className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-b from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0"
                  aria-label="Send"
                >
                  <ArrowUp size={15} className="text-white" />
                </button>
              </div>

              {/* Talk to human */}
              {handoffStatus === "bot" && (
                <div className="flex items-center justify-center mt-2.5">
                  <button
                    onClick={() => setShowHandoffDialog(true)}
                    className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors px-3 py-1 rounded-full hover:bg-gray-100"
                  >
                    <Phone size={10} />
                    Talk to a human
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Handoff dialog ── */}
      <AlertDialog open={showHandoffDialog} onOpenChange={setShowHandoffDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connect with a support agent</AlertDialogTitle>
            <AlertDialogDescription>
              We'll connect you with a support agent. This usually takes a few
              minutes. Your conversation history will be preserved. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleHandoffConfirm}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Connect me
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
