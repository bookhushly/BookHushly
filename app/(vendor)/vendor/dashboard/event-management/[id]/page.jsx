// components/event-management-dashboard.jsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useEventListing,
  useEventBookings,
  useUpdateTicketCount,
  useCheckInAttendee,
} from "@/hooks/use-event-dashboard";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Ticket,
  TrendingUp,
  Calendar,
  Search,
  Download,
  Edit2,
  Plus,
  Minus,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ScanLine,
  BarChart2,
  Tag,
  Trash2,
  Copy,
} from "lucide-react";

// ─── Status Helpers ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  confirmed: { color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
  pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  completed: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle },
  cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};
const PAYMENT_STATUS_COLOR = {
  completed: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-gray-50 text-gray-700 border-gray-200",
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { color: "bg-gray-50 text-gray-700 border-gray-200", icon: AlertCircle };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-4 h-4" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
function PaymentBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${PAYMENT_STATUS_COLOR[status] || PAYMENT_STATUS_COLOR.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, iconBg, Icon, iconColor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-medium text-gray-900">{value}</p>
          {sub && <p className="text-sm mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Ticket Editor ────────────────────────────────────────────────────────────
function TicketEditor({ current, onSave, onCancel, isSaving, error }) {
  const [count, setCount] = useState(current);
  const adjust = (delta) => setCount((p) => Math.max(0, p + delta));
  return (
    <div className="flex-1">
      <p className="text-gray-600 text-sm font-medium mb-2">Remaining Tickets</p>
      <div className="flex items-center gap-2">
        {[-10, -1].map((d) => (
          <button key={d} onClick={() => adjust(d)} disabled={isSaving}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40">
            <Minus className={d === -10 ? "w-4 h-4 text-gray-700" : "w-3 h-3 text-gray-700"} />
          </button>
        ))}
        <input type="text" inputMode="numeric" value={count} disabled={isSaving}
          onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-20 text-center text-2xl font-medium border-2 border-purple-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-40" />
        {[1, 10].map((d) => (
          <button key={d} onClick={() => adjust(d)} disabled={isSaving}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40">
            <Plus className={d === 10 ? "w-4 h-4 text-gray-700" : "w-3 h-3 text-gray-700"} />
          </button>
        ))}
      </div>
      {error && <p className="text-red-600 text-xs mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSave(count)} disabled={isSaving}
          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} disabled={isSaving}
          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function RemainingTicketsCard({ listing, isEditing, setIsEditing, updateTickets }) {
  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <TicketEditor
          current={listing.remaining_tickets}
          isSaving={updateTickets.isPending}
          error={updateTickets.error?.message}
          onSave={(n) => updateTickets.mutate(n, { onSuccess: () => setIsEditing(false) })}
          onCancel={() => { updateTickets.reset(); setIsEditing(false); }}
        />
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-200 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">Remaining Tickets</p>
          <p className="text-3xl font-medium text-gray-900">{listing.remaining_tickets.toLocaleString()}</p>
        </div>
        <button onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-purple-600 text-xs font-medium">
          <Edit2 className="w-3.5 h-3.5" /> Adjust
        </button>
      </div>
    </div>
  );
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportToCSV(bookings, eventTitle) {
  const headers = ["Customer", "Email", "Phone", "Ticket Package", "Quantity", "Amount (₦)", "Booking Date", "Status", "Payment"];
  const rows = bookings.map((b) => [
    b.users?.name || "Guest",
    b.contact_email || "",
    b.contact_phone || "",
    b.ticket_details?.package || "Standard",
    b.ticket_details?.quantity || b.guests || 1,
    parseFloat(b.total_amount || 0).toFixed(2),
    new Date(b.booking_date || b.created_at).toLocaleDateString("en-GB"),
    b.status || "",
    b.payment_status || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${eventTitle.replace(/\s+/g, "_")}_attendees.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sales Velocity Chart ─────────────────────────────────────────────────────
function SalesVelocityChart({ bookings, eventDate }) {
  const data = useMemo(() => {
    if (!bookings.length) return [];

    // Build a map of tickets sold per day
    const dailySales = {};
    bookings.forEach((b) => {
      const day = new Date(b.created_at).toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
      });
      const qty = b.ticket_details?.quantity || b.guests || 1;
      dailySales[day] = (dailySales[day] || 0) + qty;
    });

    // Sort chronologically
    const sorted = Object.entries(dailySales)
      .map(([date, tickets]) => ({ date, tickets }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Add cumulative total
    let cumulative = 0;
    return sorted.map(({ date, tickets }) => {
      cumulative += tickets;
      return { date, tickets, cumulative };
    });
  }, [bookings]);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Sales chart will appear once bookings come in
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
          formatter={(v, name) => [v, name === "cumulative" ? "Total sold" : "New tickets"]}
        />
        <Area type="monotone" dataKey="cumulative" stroke="#7c3aed" strokeWidth={2}
          fill="url(#salesGradient)" name="cumulative" dot={false} />
        <Area type="monotone" dataKey="tickets" stroke="#a78bfa" strokeWidth={1.5}
          fill="none" name="tickets" dot={false} strokeDasharray="4 2" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Refunds Panel ────────────────────────────────────────────────────────────
function RefundsPanel({ listingId }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["refund-requests", listingId],
    queryFn: async () => {
      // Vendor must use admin endpoint — use dedicated API
      const res = await fetch(`/api/vendor/events/${listingId}/refunds`);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  const respond = useMutation({
    mutationFn: async ({ id, action, vendorNote }) => {
      const res = await fetch(`/api/refunds/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, vendor_note: vendorNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["refund-requests", listingId] }),
  });

  const [notes, setNotes] = useState({});

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-purple-600" /></div>;

  if (!requests.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center max-w-2xl">
        <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No refund requests for this event.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {requests.map((r) => (
        <div key={r.id} className={`bg-white border rounded-2xl p-5 ${
          r.status === "pending" ? "border-amber-200" :
          r.status === "approved" ? "border-green-200" : "border-gray-200"
        }`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-medium text-gray-900 text-sm">{r.contact_email}</p>
              <p className="text-xs text-gray-400">Requested {new Date(r.requested_at).toLocaleDateString("en-GB")}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              r.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
              r.status === "approved" ? "bg-green-50 text-green-700 border-green-200" :
              "bg-gray-50 text-gray-600 border-gray-200"
            }`}>
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 mb-3">{r.reason}</p>
          {r.status === "pending" && (
            <div className="space-y-2">
              <input
                type="text"
                maxLength={200}
                value={notes[r.id] || ""}
                onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))}
                placeholder="Optional note to customer..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => respond.mutate({ id: r.id, action: "approve", vendorNote: notes[r.id] })}
                  disabled={respond.isPending}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Approve Refund
                </button>
                <button
                  onClick={() => respond.mutate({ id: r.id, action: "deny", vendorNote: notes[r.id] })}
                  disabled={respond.isPending}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Deny
                </button>
              </div>
            </div>
          )}
          {r.vendor_note && r.status !== "pending" && (
            <p className="text-xs text-gray-500 italic mt-2">Your note: {r.vendor_note}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Email Attendees Panel ────────────────────────────────────────────────────
function EmailAttendeesPanel({ listingId }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // null | "sending" | { sent, failed, total, remaining_today } | "error"

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`/api/vendor/events/${listingId}/email-attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setStatus(data);
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("[email-attendees]", err);
      setStatus("error");
    }
  };

  const isSending = status === "sending";
  const isSuccess = status && typeof status === "object";
  const isError = status === "error";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl space-y-5">
      <div>
        <h3 className="font-medium text-gray-900 mb-1">Email All Attendees</h3>
        <p className="text-sm text-gray-500">
          Send a custom email directly to all confirmed attendees' inboxes. Max 5 blasts per event per day.
        </p>
      </div>

      {isSuccess && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            Email sent to <strong>{status.sent}</strong> of <strong>{status.total}</strong> attendees.
            {status.failed > 0 && <span className="text-amber-700"> ({status.failed} failed)</span>}
            {status.remaining_today > 0 && (
              <span className="text-gray-500"> · {status.remaining_today} blast{status.remaining_today !== 1 ? "s" : ""} left today.</span>
            )}
          </div>
        </div>
      )}
      {isError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Failed to send. Please try again.
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Subject *</label>
        <input
          type="text"
          maxLength={150}
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setStatus(null); }}
          placeholder="e.g. Important update about your ticket"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <p className="text-xs text-gray-400 text-right">{subject.length}/150</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Message *</label>
        <textarea
          rows={6}
          maxLength={2000}
          value={message}
          onChange={(e) => { setMessage(e.target.value); setStatus(null); }}
          placeholder="Write your message here. Plain text — line breaks are preserved."
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{message.length}/2000</p>
      </div>

      <button
        onClick={handleSend}
        disabled={isSending || !subject.trim() || !message.trim()}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
      >
        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        {isSending ? "Sending emails..." : "Send Email to All Attendees"}
      </button>
    </div>
  );
}

// ─── Broadcast Panel ─────────────────────────────────────────────────────────
function BroadcastPanel({ listingId }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // null | "sending" | "sent" | "error"
  const [sentCount, setSentCount] = useState(0);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`/api/vendor/events/${listingId}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSentCount(data.sent);
      setStatus("sent");
      setTitle("");
      setMessage("");
    } catch (err) {
      console.error("[broadcast]", err);
      setStatus("error");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl space-y-5">
      <div>
        <h3 className="font-medium text-gray-900 mb-1">Broadcast to Attendees</h3>
        <p className="text-sm text-gray-500">
          Send a notification to all confirmed ticket holders for this event.
        </p>
      </div>

      {status === "sent" && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Message sent to {sentCount} attendee{sentCount !== 1 ? "s" : ""}.
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Failed to send. Please try again.
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Subject / Title</label>
        <input
          type="text"
          maxLength={100}
          value={title}
          onChange={(e) => { setTitle(e.target.value); setStatus(null); }}
          placeholder="e.g. Important update about the event"
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <p className="text-xs text-gray-400 text-right">{title.length}/100</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Message</label>
        <textarea
          rows={5}
          maxLength={1000}
          value={message}
          onChange={(e) => { setMessage(e.target.value); setStatus(null); }}
          placeholder="Write your message here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{message.length}/1000</p>
      </div>

      <button
        onClick={handleSend}
        disabled={status === "sending" || !title.trim() || !message.trim()}
        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
      >
        {status === "sending" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Mail className="w-4 h-4" />
        )}
        {status === "sending" ? "Sending..." : "Send to All Attendees"}
      </button>
    </div>
  );
}

// ─── Promo Codes Panel ────────────────────────────────────────────────────────
function PromoCodesPanel({ listingId, vendorId }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ["promo-codes", listingId],
    queryFn: async () => {
      const { data } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  const [newCode, setNewCode] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    max_uses: "",
    valid_until: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!newCode.code || !newCode.discount_value) {
      setError("Code and discount value are required");
      return;
    }
    setCreating(true);
    setError("");
    const { error: err } = await supabase.from("promo_codes").insert({
      listing_id: listingId,
      vendor_id: vendorId,
      code: newCode.code.toUpperCase().trim(),
      discount_type: newCode.discount_type,
      discount_value: parseFloat(newCode.discount_value),
      max_uses: newCode.max_uses ? parseInt(newCode.max_uses) : null,
      valid_until: newCode.valid_until || null,
    });
    if (err) {
      setError(err.message.includes("unique") ? "That code already exists for this event" : err.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["promo-codes", listingId] });
      setNewCode({ code: "", discount_type: "percentage", discount_value: "", max_uses: "", valid_until: "" });
    }
    setCreating(false);
  };

  const toggleActive = async (id, active) => {
    await supabase.from("promo_codes").update({ active: !active }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["promo-codes", listingId] });
  };

  const deleteCode = async (id) => {
    await supabase.from("promo_codes").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["promo-codes", listingId] });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-6">
      {/* Existing codes */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-purple-600" /></div>
      ) : codes.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-6">No promo codes yet. Create one below.</p>
      ) : (
        <div className="space-y-3">
          {codes.map((c) => (
            <div key={c.id} className={`flex items-center justify-between p-4 border rounded-xl transition-opacity ${c.active ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-purple-700 text-sm tracking-wider">{c.code}</span>
                  <button onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-gray-600">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {c.discount_type === "percentage" ? `${c.discount_value}% off` : `₦${c.discount_value} off`}
                  {c.max_uses && ` · ${c.used_count}/${c.max_uses} uses`}
                  {c.valid_until && ` · Expires ${new Date(c.valid_until).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(c.id, c.active)}
                  className={`text-xs px-2 py-1 rounded-full border font-medium transition-colors ${c.active ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"}`}>
                  {c.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => deleteCode(c.id)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create new */}
      <div className="space-y-3 p-4 border-2 border-dashed border-gray-200 rounded-xl">
        <h4 className="font-medium text-gray-800 text-sm">Create Promo Code</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Code *</label>
            <input value={newCode.code}
              onChange={(e) => setNewCode((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., EARLYBIRD20"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Discount Type</label>
            <select value={newCode.discount_type}
              onChange={(e) => setNewCode((p) => ({ ...p, discount_type: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₦)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">
              {newCode.discount_type === "percentage" ? "Discount %" : "Amount (₦)"} *
            </label>
            <input type="text" inputMode="decimal" value={newCode.discount_value}
              onChange={(e) => setNewCode((p) => ({ ...p, discount_value: e.target.value }))}
              placeholder={newCode.discount_type === "percentage" ? "20" : "5000"}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Max Uses (optional)</label>
            <input type="text" inputMode="numeric" value={newCode.max_uses}
              onChange={(e) => setNewCode((p) => ({ ...p, max_uses: e.target.value }))}
              placeholder="e.g., 50"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Expiry Date (optional)</label>
          <input type="date" value={newCode.valid_until}
            onChange={(e) => setNewCode((p) => ({ ...p, valid_until: e.target.value }))}
            min={new Date().toISOString().split("T")[0]}
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button onClick={handleCreate} disabled={creating}
          className="w-full py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {creating ? "Creating..." : "Create Promo Code"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const EventManagementDashboard = () => {
  const { id: listingId } = useParams();
  const router = useRouter();
  const { data: listing, isLoading: listingLoading } = useEventListing(listingId);
  const { data: bookings = [], isLoading: bookingsLoading } = useEventBookings(listingId);
  const updateTickets = useUpdateTicketCount(listingId);
  const checkIn = useCheckInAttendee(listingId);

  const [activeTab, setActiveTab] = useState("bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditingTickets, setIsEditingTickets] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const handleDuplicate = useCallback(async () => {
    if (duplicating) return;
    setDuplicating(true);
    try {
      const res = await fetch(`/api/vendor/events/${listingId}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to duplicate");
      router.push(`/vendor/dashboard/create-event?clone=${data.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setDuplicating(false);
    }
  }, [listingId, duplicating, router]);

  const stats = useMemo(() => {
    const ticketsSold = bookings.reduce(
      (sum, b) => sum + (b.ticket_details?.quantity || b.guests || 0), 0
    );
    const paidBookings = bookings.filter((b) => b.payment_status === "completed");
    const revenue = paidBookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
    const scanned = bookings.reduce((sum, b) => sum + (b.scanned_count || 0), 0);
    const ticketPackages = listing?.ticket_packages || [];
    const totalCreated =
      ticketPackages.reduce((sum, pkg) => sum + (pkg.initial_quantity || pkg.total || 0), 0) ||
      ticketsSold + (listing?.remaining_tickets || 0);
    const soldPercent = totalCreated > 0 ? ((ticketsSold / totalCreated) * 100).toFixed(1) : 0;
    return { ticketsSold, paidBookings, revenue, scanned, totalCreated, soldPercent };
  }, [bookings, listing]);

  const filteredBookings = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!lower) return true;
      return (
        (b.users?.name || "").toLowerCase().includes(lower) ||
        (b.contact_email || "").toLowerCase().includes(lower) ||
        (b.contact_phone || "").includes(searchTerm)
      );
    });
  }, [bookings, searchTerm, statusFilter]);

  const isLoading = listingLoading || bookingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Event not found</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "bookings", label: "Bookings", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "refunds", label: "Refunds", icon: AlertCircle },
    { id: "promo", label: "Promo Codes", icon: Tag },
    { id: "email", label: "Email", icon: Mail },
    { id: "broadcast", label: "Push Notify", icon: ScanLine },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-medium text-gray-900">{listing.title}</h1>
              <p className="text-gray-600 mt-1">{listing.location}</p>
            </div>
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0"
            >
              {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              {duplicating ? "Duplicating..." : "Duplicate Event"}
            </button>
          </div>
          {listing.event_date && (
            <div className="flex items-center gap-2 text-gray-600 mt-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>
                {new Date(listing.event_date).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
                {listing.event_end_date && listing.event_end_date !== listing.event_date && (
                  <> – {new Date(listing.event_end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</>
                )}
                {listing.event_time && ` · ${listing.event_time}`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard label="Total Tickets" value={stats.totalCreated.toLocaleString()}
            iconBg="bg-purple-50" Icon={Ticket} iconColor="text-purple-600" />
          <StatCard label="Tickets Sold" value={stats.ticketsSold.toLocaleString()}
            sub={<span className="text-purple-600 font-medium">{stats.soldPercent}% sold</span>}
            iconBg="bg-green-50" Icon={TrendingUp} iconColor="text-green-600" />
          <RemainingTicketsCard listing={listing} isEditing={isEditingTickets}
            setIsEditing={setIsEditingTickets} updateTickets={updateTickets} />
          <StatCard label="Total Revenue" value={`₦${stats.revenue.toLocaleString()}`}
            sub={<span className="text-gray-500">{stats.paidBookings.length} paid bookings</span>}
            iconBg="bg-blue-50" Icon={Users} iconColor="text-blue-600" />
          <StatCard label="Scanned Tickets" value={stats.scanned.toLocaleString()}
            sub={stats.ticketsSold > 0 && (
              <span className="text-gray-500">
                {((stats.scanned / stats.ticketsSold) * 100).toFixed(1)}% of sold
              </span>
            )}
            iconBg="bg-emerald-50" Icon={ScanLine} iconColor="text-emerald-600" />
        </div>

        {/* Inner Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-purple-600 text-purple-700"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Bookings Tab ── */}
        {activeTab === "bookings" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-medium text-gray-900">Event Bookings</h2>
                  <p className="text-gray-600 text-sm mt-1">{bookings.length} total bookings</p>
                </div>
                <button
                  onClick={() => exportToCSV(bookings, listing.title)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 self-start sm:self-auto text-sm font-medium">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Search by name, email, or phone..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No bookings found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Bookings will appear here once customers register"}
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Customer", "Contact", "Date", "Tickets", "Amount", "Status", "Payment", "Check-in"].map((col) => (
                        <th key={col} className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-700 font-medium text-sm">
                                {(booking.users?.name || booking.contact_email || "U").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.users?.name || "Guest User"}</p>
                              {booking.ticket_details?.package && (
                                <p className="text-xs text-gray-500">{booking.ticket_details.package} Package</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />{booking.contact_email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />{booking.contact_phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(booking.booking_date || booking.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                            {booking.ticket_details?.quantity || booking.guests} tickets
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          ₦{parseFloat(booking.total_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                        <td className="px-6 py-4"><PaymentBadge status={booking.payment_status} /></td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              checkIn.mutate({ bookingId: booking.id, checkedIn: !booking.checked_in })
                            }
                            disabled={checkIn.isPending}
                            title={booking.checked_in ? "Mark as not checked in" : "Mark as checked in"}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              booking.checked_in
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                            }`}
                          >
                            {booking.checked_in ? (
                              <><CheckCircle className="w-3.5 h-3.5" /> Checked In</>
                            ) : (
                              <><ScanLine className="w-3.5 h-3.5" /> Check In</>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Sales velocity */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-medium text-gray-900 mb-1">Ticket Sales Velocity</h3>
              <p className="text-sm text-gray-500 mb-6">
                Cumulative tickets sold over time (solid) vs. daily new sales (dashed)
              </p>
              <SalesVelocityChart bookings={bookings} eventDate={listing.event_date} />
            </div>

            {/* Ticket tier breakdown */}
            {listing.ticket_packages?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-medium text-gray-900 mb-4">Ticket Tier Breakdown</h3>
                <div className="space-y-3">
                  {listing.ticket_packages.map((pkg, i) => {
                    const sold = bookings
                      .filter((b) => b.ticket_details?.package === pkg.name && b.payment_status === "completed")
                      .reduce((s, b) => s + (b.ticket_details?.quantity || 1), 0);
                    const total = pkg.total || 1;
                    const pct = Math.min(100, (sold / total) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800">{pkg.name}</span>
                          <span className="text-gray-500">{sold} / {total} sold · ₦{(sold * pkg.price).toLocaleString()} revenue</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Booking status breakdown */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-medium text-gray-900 mb-4">Booking Status Breakdown</h3>
              {["confirmed", "pending", "completed", "cancelled"].map((status) => {
                const count = bookings.filter((b) => b.status === status).length;
                const pct = bookings.length > 0 ? ((count / bookings.length) * 100).toFixed(0) : 0;
                const colors = {
                  confirmed: "bg-green-500",
                  pending: "bg-yellow-400",
                  completed: "bg-blue-500",
                  cancelled: "bg-red-400",
                };
                return (
                  <div key={status} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium text-gray-700">{status}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[status]} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Export */}
            <div className="flex justify-end">
              <button onClick={() => exportToCSV(bookings, listing.title)}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium">
                <Download className="w-4 h-4" /> Download Full Attendee Report (CSV)
              </button>
            </div>
          </div>
        )}

        {/* ── Promo Codes Tab ── */}
        {activeTab === "promo" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl">
            <h3 className="font-medium text-gray-900 mb-1">Promo Codes</h3>
            <p className="text-sm text-gray-500 mb-6">
              Create discount codes for your attendees. Share them via social media or email.
            </p>
            <PromoCodesPanel listingId={listingId} vendorId={listing.vendor_id} />
          </div>
        )}

        {/* ── Refunds Tab ── */}
        {activeTab === "refunds" && (
          <RefundsPanel listingId={listingId} />
        )}

        {/* ── Email Tab ── */}
        {activeTab === "email" && (
          <EmailAttendeesPanel listingId={listingId} />
        )}

        {/* ── Broadcast (Push) Tab ── */}
        {activeTab === "broadcast" && (
          <BroadcastPanel listingId={listingId} />
        )}
      </div>
    </div>
  );
};

export default EventManagementDashboard;
