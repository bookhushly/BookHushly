"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  ArrowUp,
  RefreshCw,
  Minus,
  Phone,
  WifiOff,
  AlertCircle,
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
  "Hi! I'm Nora, your BookHushly assistant. Ask me anything about bookings, payments, or our services.";
const MAX_CHARS = 500;
const CHAR_WARN = 400;
const CHAR_DANGER = 480;
const MAX_RETRIES = 3;
const SEND_TIMEOUT_MS = 15000;
const QUICK_PROMPTS = [
  "How do I book a hotel?",
  "Payment methods?",
  "Track my booking",
];

// ─── Markdown Formatter ───────────────────────────────────────────────────────

function parseInline(text, codeStyle) {
  const nodes = [];
  const INLINE =
    /(`[^`]+`|\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|\*[\s\S]+?\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let key = 0;
  let match;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const m = match[0];
    if (m.startsWith("`")) {
      nodes.push(
        <code key={key++} className={codeStyle}>
          {m.slice(1, -1)}
        </code>,
      );
    } else if (m.startsWith("***")) {
      nodes.push(
        <strong key={key++} className="font-medium italic">
          {m.slice(3, -3)}
        </strong>,
      );
    } else if (m.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-medium text-gray-900">
          {m.slice(2, -2)}
        </strong>,
      );
    } else if (m.startsWith("*")) {
      nodes.push(
        <em key={key++} className="italic">
          {m.slice(1, -1)}
        </em>,
      );
    } else if (m.startsWith("[")) {
      nodes.push(
        <a
          key={key++}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 underline underline-offset-2 hover:text-violet-700 transition-colors"
        >
          {match[2]}
        </a>,
      );
    }
    last = match.index + m.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function FormattedMessage({ content, variant = "bot" }) {
  const codeStyle =
    variant === "agent"
      ? "bg-white text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded text-[11px] font-mono"
      : "bg-white text-violet-700 border border-gray-200 px-1.5 py-0.5 rounded text-[11px] font-mono";

  const blocks = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push(
        <div
          key={`code-${i}`}
          className="my-2 rounded-xl overflow-hidden shadow-sm"
        >
          {lang && (
            <div className="bg-gray-800 px-3 py-1.5 flex items-center gap-1.5 border-b border-gray-700/60">
              <span className="w-2 h-2 rounded-full bg-red-400/70" />
              <span className="w-2 h-2 rounded-full bg-amber-400/70" />
              <span className="w-2 h-2 rounded-full bg-green-400/70" />
              <span className="ml-2 text-[10px] font-mono text-gray-400">
                {lang}
              </span>
            </div>
          )}
          <pre className="bg-gray-900 text-emerald-300 p-3 text-[11px] font-mono overflow-x-auto leading-relaxed whitespace-pre">
            <code>{codeLines.join("\n")}</code>
          </pre>
        </div>,
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <p
          key={`h3-${i}`}
          className="text-xs font-medium text-gray-700 mt-2.5 mb-0.5"
        >
          {parseInline(line.slice(4), codeStyle)}
        </p>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        <p
          key={`h2-${i}`}
          className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mt-3 mb-1"
        >
          {parseInline(line.slice(3), codeStyle)}
        </p>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push(
        <p
          key={`h1-${i}`}
          className="text-sm font-medium text-gray-900 mt-1 mb-1.5"
        >
          {parseInline(line.slice(2), codeStyle)}
        </p>,
      );
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push(
        <hr key={`hr-${i}`} className="border-t border-gray-200 my-2.5" />,
      );
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <div key={`bq-${i}`} className="flex gap-2.5 my-1.5">
          <div className="w-[3px] rounded-full bg-violet-300 flex-shrink-0 self-stretch" />
          <p className="text-xs text-gray-600 italic leading-relaxed">
            {parseInline(quoteLines.join(" "), codeStyle)}
          </p>
        </div>,
      );
      continue;
    }

    if (/^[-*+] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+] /, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-[5px] h-[5px] rounded-full bg-violet-400 mt-[8px] flex-shrink-0" />
              <span className="text-sm leading-relaxed">
                {parseInline(item, codeStyle)}
              </span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="space-y-2 my-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-[18px] h-[18px] rounded-full bg-violet-100 text-violet-600 text-[10px] font-medium flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-violet-200">
                {idx + 1}
              </span>
              <span className="text-sm leading-relaxed flex-1">
                {parseInline(item, codeStyle)}
              </span>
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const pLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !/^[-*+] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    if (pLines.length) {
      blocks.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed">
          {parseInline(pLines.join(" "), codeStyle)}
        </p>,
      );
    }
  }

  return <div className="space-y-0.5">{blocks}</div>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-violet-100">
      <MessageCircle size={13} className="text-white" />
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
    <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-medium shadow-sm ring-2 ring-violet-100">
      {initials}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-start gap-2 mb-4">
      <BotAvatar />
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-gray-400 rounded-full block bh-typing-dot"
              style={{ animationDelay: `${i * 0.18}s` }}
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
      <div className="flex justify-end mb-3 bh-msg-in">
        <div className="max-w-[76%] flex flex-col items-end gap-1">
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed",
              isFailed
                ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                : "bg-violet-600 text-white shadow-sm shadow-violet-200",
            )}
          >
            {msg.content}
          </div>
          <div className="flex items-center gap-2 pr-1">
            {isSendingMsg && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="w-1 h-1 rounded-full bg-gray-300 inline-block bh-pulse" />
                Sending
              </span>
            )}
            {isFailed && (
              <button
                onClick={() => onRetry(msg)}
                className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                <RefreshCw size={9} />
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
      <div className="flex items-start gap-2 mb-3 bh-msg-in">
        <BotAvatar />
        <div className="max-w-[76%] bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-sm">
          <FormattedMessage content={msg.content} variant="bot" />
        </div>
      </div>
    );
  }

  if (msg.role === "agent") {
    return (
      <div className="flex items-start gap-2 mb-3 bh-msg-in">
        <AgentAvatar name={agentName} />
        <div className="max-w-[76%]">
          <p className="text-[10px] font-medium text-gray-400 mb-1 ml-0.5 uppercase tracking-wider">
            {agentName || "Agent"}
          </p>
          <div className="bg-violet-50 border-l-[3px] border-violet-400 text-gray-900 px-4 py-3 rounded-2xl rounded-bl-sm">
            <FormattedMessage content={msg.content} variant="agent" />
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
  const textareaRef = useRef(null);

  const supabase = createClient();

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Auto-scroll
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

  // Session + conversation init
  useEffect(() => {
    let sid = localStorage.getItem("bh_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("bh_session_id", sid);
    }
    sessionId.current = sid;
  }, []);

  // Fetch history on open
  useEffect(() => {
    if (isOpen && conversationIdRef.current && messages.length === 0) {
      fetchHistory(conversationIdRef.current);
    }
  }, [isOpen]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    setupRealtime(conversationId);
    return () => teardownRealtime();
  }, [conversationId]);

  // Textarea auto-resize
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, []);

  useEffect(() => {
    autoResize();
  }, [inputValue, autoResize]);

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
        setMessages(
          msgs.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            status: m.status || "sent",
            timestamp: m.created_at,
          })),
        );
      }
    } catch (err) {
      console.error("fetchHistory:", err);
    }
  };

  const fetchAgentName = async (assignedTo) => {
    const { data } = await supabase
      .from("users")
      .select("name")
      .eq("id", assignedTo)
      .single();
    setAgentName(data?.name || null);
  };

  // ── Realtime ──────────────────────────────────────────────────────────────

  const setupRealtime = (convId) => {
    teardownRealtime();

    const msgCh = supabase
      .channel(`widget-msgs-${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (p) => {
          const msg = p.new;
          if (msg.role !== "user") {
            setMessages((prev) => {
              if (prev.find((m) => m.id === msg.id)) return prev;
              if (!isOpen) setUnreadCount((c) => c + 1);
              return [
                ...prev,
                {
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  status: "sent",
                  timestamp: msg.created_at,
                },
              ];
            });
          }
        },
      )
      .subscribe((s) => {
        if (s === "SUBSCRIBED") {
          setRealtimeStatus("connected");
          reconnectAttemptsRef.current = 0;
        }
        if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
          setRealtimeStatus("reconnecting");
          scheduleReconnect(convId);
        }
      });

    const convCh = supabase
      .channel(`widget-conv-${convId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_conversations",
          filter: `id=eq.${convId}`,
        },
        (p) => {
          const u = p.new;
          setHandoffStatus(u.status);
          if (u.assigned_to && u.status === "active_human")
            fetchAgentName(u.assigned_to);
          if (u.status === "resolved") {
            conversationIdRef.current = null;
            setConversationId(null);
          }
        },
      )
      .subscribe();

    channelRef.current = msgCh;
    convChannelRef.current = convCh;
  };

  const teardownRealtime = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (convChannelRef.current) {
      supabase.removeChannel(convChannelRef.current);
      convChannelRef.current = null;
    }
    clearTimeout(reconnectTimerRef.current);
  };

  const scheduleReconnect = (convId) => {
    if (reconnectAttemptsRef.current >= 5) {
      setRealtimeStatus("failed");
      return;
    }
    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      setupRealtime(convId);
    }, 5000);
  };

  // ── Send logic ────────────────────────────────────────────────────────────

  const sendMessage = async (content) => {
    if (!content || isSending.current || !isOnline) return;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;

    const msgId = crypto.randomUUID();
    isSending.current = true;
    setInputValue("");
    setCharCount(0);
    setTimeoutMsg(false);

    messageQueue.current.push({
      id: msgId,
      content: trimmed,
      timestamp: Date.now(),
      retries: 0,
    });
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        role: "user",
        content: trimmed,
        status: "sending",
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsTyping(true);

    let success = false;
    let retries = 0;

    while (!success && retries <= MAX_RETRIES) {
      if (retries > 0)
        await new Promise((r) => setTimeout(r, Math.pow(2, retries - 1) * 500));

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const tid = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

        const history = messagesRef.current
          .filter((m) => m.status !== "failed" && m.id !== msgId)
          .map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          }));
        history.push({ role: "user", content: trimmed });

        const res = await fetch("/api/support/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            conversationId: conversationIdRef.current,
            sessionId: sessionId.current,
          }),
          signal: controller.signal,
        });

        clearTimeout(tid);
        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();
        success = true;

        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, status: "sent" } : m)),
        );

        if (data.conversationId && !conversationIdRef.current) {
          conversationIdRef.current = data.conversationId;
          setConversationId(data.conversationId);
        }

        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.reply,
              status: "sent",
              timestamp: new Date().toISOString(),
            },
          ]);
        }

        if (data.timeout) setTimeoutMsg(true);
        messageQueue.current = messageQueue.current.filter(
          (q) => q.id !== msgId,
        );
      } catch (err) {
        if (err.name === "AbortError") {
          setIsTyping(false);
          isSending.current = false;
          setTimeoutMsg(true);
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, status: "failed" } : m)),
          );
          messageQueue.current = messageQueue.current.filter(
            (q) => q.id !== msgId,
          );
          return;
        }
        retries++;
        if (retries > MAX_RETRIES) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, status: "failed" } : m)),
          );
          messageQueue.current = messageQueue.current.map((q) =>
            q.id === msgId ? { ...q, failed: true } : q,
          );
        }
      }
    }

    setIsTyping(false);
    isSending.current = false;
  };

  const retryMessage = (msg) => {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    messageQueue.current = messageQueue.current.filter((q) => q.id !== msg.id);
    sendMessage(msg.content);
  };

  const handleHandoffConfirm = async () => {
    setShowHandoffDialog(false);
    if (!conversationIdRef.current) {
      await sendMessage("I'd like to speak with a human agent.");
      return;
    }
    try {
      await supabase
        .from("support_conversations")
        .update({ status: "pending_human" })
        .eq("id", conversationIdRef.current);
      setHandoffStatus("pending_human");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "You've been added to the queue. An agent will join shortly — your conversation history is preserved.",
          status: "sent",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Handoff:", err);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const isPendingHuman = handoffStatus === "pending_human";
  const isActiveHuman = handoffStatus === "active_human";
  const isEmpty = messages.length === 0;
  const canSend = inputValue.trim().length > 0 && !isTyping && isOnline;

  const panelClass = isMobile
    ? "fixed inset-0 z-50 flex flex-col"
    : "fixed bottom-[88px] right-5 z-50 w-[390px] h-[580px] flex flex-col rounded-2xl overflow-hidden";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .bh-msg-in { animation: bhMsgIn 0.2s cubic-bezier(0.16,1,0.3,1); }
        @keyframes bhMsgIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .bh-typing-dot {
          animation: bhTyping 1.1s ease-in-out infinite;
        }
        @keyframes bhTyping {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        .bh-pulse {
          animation: bhPulse 1.4s ease-in-out infinite;
        }
        @keyframes bhPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        .bh-fab-ring {
          animation: bhFabRing 2.5s ease-in-out infinite;
        }
        @keyframes bhFabRing {
          0%, 100% { box-shadow: 0 4px 20px rgba(124,58,237,0.35), 0 0 0 0 rgba(124,58,237,0.3); }
          50%       { box-shadow: 0 4px 20px rgba(124,58,237,0.35), 0 0 0 8px rgba(124,58,237,0); }
        }
        .bh-scrollbar::-webkit-scrollbar { width: 4px; }
        .bh-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .bh-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
        .bh-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>

      {/* ── FAB ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
            className={cn(
              "fixed bottom-5 right-5 z-50 w-14 h-14 bg-violet-600 hover:bg-violet-700 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200",
              unreadCount > 0 && "bh-fab-ring",
            )}
            aria-label="Open support chat"
          >
            <MessageCircle size={22} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 ring-2 ring-white rounded-full flex items-center justify-center text-white text-[10px] font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              panelClass,
              "bg-white shadow-2xl border border-gray-100",
            )}
          >
            {/* ── Header ── */}
            <div className="flex-shrink-0 bg-violet-600 px-4 py-3.5">
              {/* Offline banner */}
              {!isOnline && (
                <div className="flex items-center gap-2 mb-3 -mx-4 -mt-3.5 px-4 py-2 bg-purple-500/90 text-white text-xs font-medium">
                  <WifiOff size={12} />
                  You're offline. Messages will send when you reconnect.
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={17} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm leading-tight">
                      Nora — BookHushly Support
                    </p>
                    {/* Status line — only one shown at a time */}
                    {!isPendingHuman &&
                      !isActiveHuman &&
                      realtimeStatus !== "reconnecting" && (
                        <p className="text-violet-200 text-xs mt-0.5">
                          Typically replies instantly
                        </p>
                      )}
                    {isPendingHuman && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-200 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full bh-pulse" />
                        Waiting for agent…
                      </span>
                    )}
                    {isActiveHuman && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-green-200 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        {agentName
                          ? `Chatting with ${agentName}`
                          : "Agent joined"}
                      </span>
                    )}
                    {realtimeStatus === "reconnecting" &&
                      !isPendingHuman &&
                      !isActiveHuman && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-200 mt-0.5">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full bh-pulse" />
                          Reconnecting…
                        </span>
                      )}
                  </div>
                </div>

                {/* Controls — close only; minimize is redundant here */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Minimise"
                  >
                    <Minus size={13} className="text-white/80" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X size={13} className="text-white/80" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Realtime failed banner ── */}
            {realtimeStatus === "failed" && (
              <div className="flex-shrink-0 px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <AlertCircle size={11} />
                  Live updates paused.
                </span>
                <button
                  onClick={() => window.location.reload()}
                  className="underline font-medium"
                >
                  Refresh
                </button>
              </div>
            )}

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bh-scrollbar">
              {/* Greeting — always present */}
              <div className="flex items-start gap-2 mb-3">
                <BotAvatar />
                <div className="max-w-[76%] bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <FormattedMessage content={GREETING} variant="bot" />
                </div>
              </div>

              {/* Empty state */}
              {isEmpty && !isTyping && (
                <div className="flex flex-col items-center justify-center py-6 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
                    <MessageCircle size={22} className="text-violet-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    How can we help?
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    Ask about bookings, payments, vendors, or anything else.
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {QUICK_PROMPTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setInputValue(q);
                          setCharCount(q.length);
                          textareaRef.current?.focus();
                        }}
                        className="text-xs bg-gray-50 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 text-gray-600 px-3 py-1.5 rounded-full transition-all duration-150 border border-gray-200"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onRetry={retryMessage}
                  agentName={agentName}
                />
              ))}

              {/* Typing */}
              {isTyping && <TypingDots />}

              {/* Timeout state */}
              {timeoutMsg && (
                <div className="flex items-start gap-2 mb-3 bh-msg-in">
                  <BotAvatar />
                  <div className="max-w-[76%] bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <p className="text-sm mb-2">Taking longer than usual…</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          abortControllerRef.current?.abort();
                          setIsTyping(false);
                          setTimeoutMsg(false);
                          isSending.current = false;
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setTimeoutMsg(false);
                          const last = messagesRef.current
                            .filter((m) => m.role === "user")
                            .at(-1);
                          if (last) retryMessage(last);
                        }}
                        className="text-xs text-violet-600 hover:text-violet-700 font-medium underline transition-colors"
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
              className="flex-shrink-0 bg-white border-t border-gray-100 px-3.5 pt-3 pb-3"
              style={{
                paddingBottom: "max(12px, env(safe-area-inset-bottom))",
              }}
            >
              <div
                className={cn(
                  "flex items-end gap-2 bg-gray-50 rounded-2xl border transition-all duration-150 px-3.5 py-2.5",
                  isOnline
                    ? "border-gray-200 focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-100"
                    : "opacity-50 pointer-events-none border-gray-200",
                )}
              >
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    if (e.target.value.length > MAX_CHARS) return;
                    setInputValue(e.target.value);
                    setCharCount(e.target.value.length);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(inputValue);
                    }
                  }}
                  placeholder="Message…"
                  rows={1}
                  disabled={!isOnline}
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none outline-none leading-relaxed py-0.5"
                  style={{ maxHeight: "100px", overflowY: "auto" }}
                />
                {charCount >= CHAR_WARN && (
                  <span
                    className={cn(
                      "flex-shrink-0 text-[11px] tabular-nums font-medium self-center",
                      charCount >= CHAR_DANGER
                        ? "text-red-500"
                        : "text-amber-500",
                    )}
                  >
                    {MAX_CHARS - charCount}
                  </span>
                )}
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!canSend}
                  className="flex-shrink-0 w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150 shadow-sm hover:shadow-md self-end"
                  aria-label="Send"
                >
                  <ArrowUp size={14} className="text-white" />
                </button>
              </div>

              {/* Handoff + branding row */}
              <div className="flex items-center justify-between mt-2">
                {handoffStatus === "bot" ? (
                  <button
                    onClick={() => setShowHandoffDialog(true)}
                    className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors px-1"
                  >
                    <Phone size={10} />
                    Talk to a human
                  </button>
                ) : (
                  <span />
                )}
                <span className="text-[10px] text-gray-300 font-medium tracking-wide">
                  Powered by BookHushly
                </span>
              </div>
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
              minutes. Your conversation history will be preserved.
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
