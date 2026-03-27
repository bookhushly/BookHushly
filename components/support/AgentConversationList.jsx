"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

function relativeTime(ts) {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch {
    return "";
  }
}

function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function ConversationRow({ conv, selected, onClick }) {
  const isPending = conv.status === "pending_human";
  const name = conv.user_name || (conv.session_id ? "Guest" : "Unknown");

  return (
    <button
      onClick={() => onClick(conv)}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50",
        selected && "bg-violet-50",
        isPending && !selected && "border-l-4 border-l-violet-600 bg-violet-50/30",
        conv.flash && "ring-2 ring-violet-400"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-0.5">
        <span className="text-sm font-medium text-gray-900 truncate">{name}</span>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {relativeTime(conv.updated_at || conv.created_at)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500 truncate">
          {truncate(conv.last_message || "No messages yet", 60)}
        </p>
        {isPending && (
          <Badge className="text-xs bg-violet-100 text-violet-700 border-0 flex-shrink-0">
            Pending
          </Badge>
        )}
        {conv.status === "active_human" && (
          <Badge className="text-xs bg-green-100 text-green-700 border-0 flex-shrink-0">
            Active
          </Badge>
        )}
        {conv.status === "resolved" && (
          <Badge className="text-xs bg-gray-100 text-gray-500 border-0 flex-shrink-0">
            Resolved
          </Badge>
        )}
      </div>
    </button>
  );
}

function EmptyState({ tab }) {
  const configs = {
    pending: {
      icon: <Inbox className="h-10 w-10 text-gray-300" />,
      title: "No pending conversations",
      sub: "New support requests will appear here.",
    },
    active: {
      icon: <MessageCircle className="h-10 w-10 text-gray-300" />,
      title: "No active conversations",
      sub: "Claimed conversations will appear here.",
    },
    resolved: {
      icon: <MessageCircle className="h-10 w-10 text-gray-300" />,
      title: "No resolved conversations",
      sub: "Resolved conversations will appear here.",
    },
  };
  const c = configs[tab] || configs.pending;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {c.icon}
      <p className="mt-3 text-sm font-medium text-gray-600">{c.title}</p>
      <p className="mt-1 text-xs text-gray-400">{c.sub}</p>
    </div>
  );
}

export default function AgentConversationList({
  currentAgent,
  initialCounts,
  selectedId,
  onSelect,
}) {
  const [activeTab, setActiveTab] = useState("pending");
  const [conversations, setConversations] = useState({
    pending: [],
    active: [],
    resolved: [],
  });
  const [counts, setCounts] = useState(initialCounts || { pending: 0, active: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  const channelRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const notifiedIdsRef = useRef(new Set());

  const supabase = createClient();

  async function fetchConversations() {
    setLoading(true);
    try {
      const statusMap = {
        pending: "pending_human",
        active: "active_human",
        resolved: "resolved",
      };

      const { data: convs, error } = await supabase
        .from("support_conversations")
        .select("id, status, session_id, user_id, created_at, updated_at, assigned_to")
        .in("status", ["pending_human", "active_human", "resolved"])
        .order("updated_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user names
      const userIds = [...new Set(convs.filter((c) => c.user_id).map((c) => c.user_id))];
      let userMap = {};
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("id, name, email")
          .in("id", userIds);
        if (users) {
          users.forEach((u) => {
            userMap[u.id] = u;
          });
        }
      }

      // Fetch last message for each conversation
      const convIds = convs.map((c) => c.id);
      let lastMsgMap = {};
      if (convIds.length > 0) {
        const { data: msgs } = await supabase
          .from("support_messages")
          .select("conversation_id, content, created_at, role")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false });

        if (msgs) {
          msgs.forEach((m) => {
            if (!lastMsgMap[m.conversation_id]) {
              lastMsgMap[m.conversation_id] = m.content;
            }
          });
        }
      }

      // Enrich and partition
      const enriched = convs.map((c) => ({
        ...c,
        user_name: c.user_id ? userMap[c.user_id]?.name || null : null,
        user_email: c.user_id ? userMap[c.user_id]?.email || null : null,
        last_message: lastMsgMap[c.id] || null,
        flash: false,
      }));

      const newCounts = { pending: 0, active: 0, resolved: 0 };
      const partitioned = { pending: [], active: [], resolved: [] };
      enriched.forEach((c) => {
        if (c.status === "pending_human") {
          partitioned.pending.push(c);
          newCounts.pending++;
        } else if (c.status === "active_human") {
          partitioned.active.push(c);
          newCounts.active++;
        } else if (c.status === "resolved") {
          partitioned.resolved.push(c);
          newCounts.resolved++;
        }
      });

      setConversations(partitioned);
      setCounts(newCounts);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  const setupRealtime = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel("agent-conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_conversations",
        },
        (payload) => {
          // Re-fetch to get updated data with user info
          fetchConversations();

          const conv = payload.new;
          if (
            payload.eventType === "INSERT" &&
            conv.status === "pending_human" &&
            !notifiedIdsRef.current.has(conv.id)
          ) {
            notifiedIdsRef.current.add(conv.id);

            // Flash animation
            setConversations((prev) => {
              const updated = prev.pending.map((c) =>
                c.id === conv.id ? { ...c, flash: true } : c
              );
              setTimeout(() => {
                setConversations((p) => ({
                  ...p,
                  pending: p.pending.map((c) =>
                    c.id === conv.id ? { ...c, flash: false } : c
                  ),
                }));
              }, 500);
              return { ...prev, pending: updated };
            });

            // Browser notification
            if (Notification.permission === "granted") {
              new Notification("New support request", {
                body: `New support request from ${conv.session_id ? "Guest" : "User"}`,
                icon: "/logo.png",
              });
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          reconnectAttemptsRef.current = 0;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          handleReconnect();
        }
      });

    channelRef.current = channel;
  }, []);

  function handleReconnect() {
    if (reconnectAttemptsRef.current >= 5) return;
    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      setupRealtime();
    }, 5000);
  }

  useEffect(() => {
    fetchConversations();
    setupRealtime();

    // Request browser notification permission
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  // Update browser tab title with pending count
  useEffect(() => {
    if (counts.pending > 0) {
      document.title = `(${counts.pending}) Support — BookHushly`;
    } else {
      document.title = "Support — BookHushly";
    }
    return () => {
      document.title = "Support — BookHushly";
    };
  }, [counts.pending]);

  const tabList = [
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "active", label: "Active", count: counts.active },
    { key: "resolved", label: "Resolved", count: counts.resolved },
  ];

  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-medium text-gray-900">Conversations</h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-3 pt-2 pb-1 border-b border-gray-100">
          <TabsList className="w-full grid grid-cols-3 h-8">
            {tabList.map((t) => (
              <TabsTrigger key={t.key} value={t.key} className="text-xs gap-1">
                {t.label}
                {t.count > 0 && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-4 h-4 rounded-full text-xs font-medium",
                      t.key === "pending"
                        ? "bg-violet-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    )}
                  >
                    {t.count > 99 ? "99+" : t.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabList.map((t) => (
          <TabsContent
            key={t.key}
            value={t.key}
            className="flex-1 overflow-y-auto mt-0"
          >
            {loading ? (
              <div className="space-y-px p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-2 py-3">
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : conversations[t.key].length === 0 ? (
              <EmptyState tab={t.key} />
            ) : (
              conversations[t.key].map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  selected={selectedId === conv.id}
                  onClick={onSelect}
                />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
