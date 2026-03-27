"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, MessageCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { createClient } from "@/lib/supabase/client";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatMsgTime(ts) {
  const d = parseISO(ts);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return `Yesterday ${format(d, "HH:mm")}`;
  return format(d, "d MMM, HH:mm");
}

// ── component ────────────────────────────────────────────────────────────────

export default function BookingMessages({ bookingId }) {
  const [messages, setMessages] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [myId, setMyId] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/apartment/${bookingId}/messages`);
      if (res.status === 401) { setError("Sign in to view messages."); setLoading(false); return; }
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages || []);
      setMyRole(data.role);
      const { data: { user } } = await supabase.auth.getUser();
      setMyId(user?.id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`booking-messages-${bookingId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "booking_messages", filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMessages, bookingId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    const text = draft.trim();
    setDraft("");
    try {
      const res = await fetch(`/api/bookings/apartment/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Send failed");
      }
    } catch (err) {
      toast.error(err.message || "Failed to send message");
      setDraft(text); // restore draft
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );
  }

  const otherRole = myRole === "guest" ? "Host" : "Guest";

  return (
    <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <MessageCircle className="h-4 w-4 text-violet-500" />
        <span className="text-sm font-medium text-gray-800">
          Messages {myRole ? `· as ${myRole}` : ""}
        </span>
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto max-h-80 p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No messages yet. Say hello to your {otherRole.toLowerCase()}!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === myId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                isMine
                  ? "bg-violet-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
                {!isMine && (
                  <p className="text-[10px] font-medium mb-1 capitalize opacity-60">{msg.sender_role}</p>
                )}
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                <p className={`text-[10px] mt-1 text-right ${isMine ? "text-violet-200" : "text-gray-400"}`}>
                  {formatMsgTime(msg.created_at)}
                  {isMine && msg.read_at && " · Read"}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {myRole ? (
        <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-gray-100">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message your ${otherRole.toLowerCase()}…`}
            maxLength={2000}
            className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      ) : (
        <div className="p-3 border-t border-gray-100 text-center text-xs text-gray-400">
          Sign in to send messages
        </div>
      )}
    </div>
  );
}
