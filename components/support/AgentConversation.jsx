"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCircle, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

function relativeTime(ts) {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch {
    return "";
  }
}

function getInitials(name) {
  if (!name) return "AG";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function MessageBubble({ msg, agentName }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[75%]">
          <div className="bg-violet-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed">
            {msg.content}
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">
            {relativeTime(msg.created_at)}
          </p>
        </div>
      </div>
    );
  }

  if (msg.role === "assistant") {
    return (
      <div className="flex justify-start mb-3">
        <div className="max-w-[75%]">
          <p className="text-xs text-gray-400 mb-1 ml-1">Nora</p>
          <div className="bg-white border border-gray-100 text-gray-900 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed shadow-sm">
            {msg.content}
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-1">
            {relativeTime(msg.created_at)}
          </p>
        </div>
      </div>
    );
  }

  if (msg.role === "agent") {
    const name = agentName || "Agent";
    return (
      <div className="flex justify-start mb-3 gap-2">
        <div className="w-7 h-7 rounded-full bg-violet-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-medium mt-1">
          {getInitials(name)}
        </div>
        <div className="max-w-[75%]">
          <p className="text-xs text-gray-400 mb-1">{name}</p>
          <div className="bg-violet-50 border-l-2 border-violet-400 text-gray-900 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
            {msg.content}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {relativeTime(msg.created_at)}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function AgentConversation({ conversation, currentAgent, onUpdate }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyValue, setReplyValue] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [assignedAgentName, setAssignedAgentName] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState("idle");

  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);

  const supabase = createClient();

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchMessages(convId) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("id, role, content, status, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAssignedAgent(assignedTo) {
    if (!assignedTo) {
      setAssignedAgentName(null);
      return;
    }
    const { data } = await supabase
      .from("users")
      .select("name")
      .eq("id", assignedTo)
      .single();
    setAssignedAgentName(data?.name || null);
  }

  const setupRealtime = useCallback(
    (convId) => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`agent-messages-${convId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_messages",
            filter: `conversation_id=eq.${convId}`,
          },
          (payload) => {
            const msg = payload.new;
            setMessages((prev) => {
              if (prev.find((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setRealtimeStatus("connected");
            reconnectAttemptsRef.current = 0;
          }
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setRealtimeStatus("reconnecting");
            handleReconnect(convId);
          }
        });

      channelRef.current = channel;
    },
    []
  );

  function handleReconnect(convId) {
    if (reconnectAttemptsRef.current >= 5) {
      setRealtimeStatus("failed");
      return;
    }
    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      setupRealtime(convId);
    }, 5000);
  }

  useEffect(() => {
    if (!conversation?.id) {
      setMessages([]);
      setAssignedAgentName(null);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    fetchMessages(conversation.id);
    fetchAssignedAgent(conversation.assigned_to);
    setupRealtime(conversation.id);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      clearTimeout(reconnectTimerRef.current);
    };
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleClaim() {
    if (!conversation?.id) return;
    try {
      const { data, error } = await supabase.rpc("claim_conversation", {
        conv_id: conversation.id,
        agent_id: currentAgent.id,
      });

      if (error) throw error;

      if (data === false || data === null) {
        toast.error("Another agent just claimed this conversation.");
        return;
      }

      onUpdate?.({ status: "active_human", assigned_to: currentAgent.id });
      setAssignedAgentName(currentAgent.name);
      toast.success("Conversation claimed.");
    } catch (err) {
      console.error("Claim error:", err);
      toast.error("Failed to claim conversation. Please try again.");
    }
  }

  async function handleResolve() {
    if (!conversation?.id) return;
    try {
      const { error } = await supabase
        .from("support_conversations")
        .update({ status: "resolved" })
        .eq("id", conversation.id);

      if (error) throw error;

      onUpdate?.({ status: "resolved" });
      toast.success("Conversation resolved.");
    } catch (err) {
      console.error("Resolve error:", err);
      toast.error("Failed to resolve. Please try again.");
    }
  }

  async function handleSendReply() {
    const trimmed = replyValue.trim();
    if (!trimmed || isSendingReply || !conversation?.id) return;

    setIsSendingReply(true);
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();

    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "agent", content: trimmed, created_at: now, _temp: true },
    ]);
    setReplyValue("");

    try {
      const { data: inserted, error } = await supabase
        .from("support_messages")
        .insert({
          conversation_id: conversation.id,
          role: "agent",
          content: trimmed,
          status: "sent",
        })
        .select("id, role, content, created_at")
        .single();

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...inserted, _temp: false } : m))
      );
    } catch (err) {
      console.error("Send reply error:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Failed to send message. Please try again.");
      setReplyValue(trimmed);
    } finally {
      setIsSendingReply(false);
    }
  }

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">
          Select a conversation to begin
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Choose from the list on the left
        </p>
      </div>
    );
  }

  const isPending = conversation.status === "pending_human";
  const isActive = conversation.status === "active_human";
  const isResolved = conversation.status === "resolved";
  const isMyConversation = conversation.assigned_to === currentAgent.id;
  const isOtherAgentConversation =
    isActive && conversation.assigned_to && !isMyConversation;

  const userName =
    conversation.user_name || (conversation.session_id ? "Guest" : "User");

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </p>
            {conversation.user_email && (
              <p className="text-xs text-gray-400 truncate">
                {conversation.user_email}
              </p>
            )}
          </div>
          {isPending && (
            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
              Pending
            </Badge>
          )}
          {isActive && (
            <Badge className="bg-green-100 text-green-700 border-0 text-xs">
              Active
            </Badge>
          )}
          {isResolved && (
            <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">
              Resolved
            </Badge>
          )}
          {realtimeStatus === "reconnecting" && (
            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs animate-pulse">
              Reconnecting…
            </Badge>
          )}
          {realtimeStatus === "failed" && (
            <Badge className="bg-red-100 text-red-600 border-0 text-xs">
              Live updates paused
            </Badge>
          )}
        </div>
        {isActive && isMyConversation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResolve}
            className="text-gray-500 hover:text-gray-900 gap-1.5"
          >
            <CheckCircle size={15} />
            Resolve
          </Button>
        )}
      </div>

      {/* Other agent banner */}
      {isOtherAgentConversation && (
        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
          This conversation is being handled by{" "}
          <span className="font-medium">
            {assignedAgentName || "another agent"}
          </span>
          .
        </div>
      )}

      {/* Realtime failed banner */}
      {realtimeStatus === "failed" && (
        <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 flex items-center justify-between">
          <span>Live updates paused. Refresh to reconnect.</span>
          <button
            onClick={() => window.location.reload()}
            className="underline ml-2 font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  i % 2 === 0 ? "justify-end" : "justify-start"
                )}
              >
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            No messages yet.
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              agentName={assignedAgentName}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Claim button (pending) */}
      {isPending && (
        <div className="px-5 py-3 border-t border-gray-100 bg-white">
          <Button
            onClick={handleClaim}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            Claim this conversation
          </Button>
        </div>
      )}

      {/* Reply input (active + my conversation) */}
      {isActive && isMyConversation && (
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
            <textarea
              value={replyValue}
              onChange={(e) => setReplyValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder="Reply as agent…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none outline-none leading-relaxed"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={handleSendReply}
              disabled={!replyValue.trim() || isSendingReply}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Resolved — no input */}
      {isResolved && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
          This conversation has been resolved.
        </div>
      )}
    </div>
  );
}
