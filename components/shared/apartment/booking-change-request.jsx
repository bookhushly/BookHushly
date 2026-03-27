"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
};
const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  declined: XCircle,
};

function ChangeRequestItem({ req }) {
  const Icon = STATUS_ICONS[req.status] || Clock;
  return (
    <div className={`p-3 rounded-xl border text-sm ${STATUS_STYLES[req.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium capitalize">{req.status} — Date change</p>
          <p className="text-xs mt-0.5">
            Requested: {format(parseISO(req.new_check_in), "d MMM yyyy")} → {format(parseISO(req.new_check_out), "d MMM yyyy")}
          </p>
          {req.reason && <p className="text-xs mt-0.5 opacity-80">{req.reason}</p>}
          {req.vendor_note && <p className="text-xs mt-1 italic">Host note: {req.vendor_note}</p>}
        </div>
        <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      </div>
    </div>
  );
}

export default function BookingChangeRequest({ bookingId, checkIn, checkOut, bookingStatus }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState("");
  const [newCheckOut, setNewCheckOut] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const canRequest = ["confirmed", "pending"].includes(bookingStatus);
  const hasPending = requests.some((r) => r.status === "pending");

  useEffect(() => {
    fetch(`/api/bookings/apartment/${bookingId}/change-request`)
      .then((r) => r.json())
      .then((d) => setRequests(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCheckIn || !newCheckOut) { toast.error("Select both dates"); return; }
    if (newCheckOut <= newCheckIn) { toast.error("Check-out must be after check-in"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/apartment/${bookingId}/change-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_check_in: newCheckIn, new_check_out: newCheckOut, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");
      toast.success("Date change request sent to host");
      setRequests((prev) => [data.data, ...prev]);
      setShowForm(false);
      setNewCheckIn(""); setNewCheckOut(""); setReason("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!canRequest && requests.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-violet-500" />
          Date change
        </p>
        {canRequest && !hasPending && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
          >
            Request change →
          </button>
        )}
      </div>

      {loading && <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-gray-300" /></div>}

      {/* Past requests */}
      {requests.map((req) => <ChangeRequestItem key={req.id} req={req} />)}

      {/* Info if pending exists */}
      {hasPending && (
        <div className="flex items-start gap-1.5 text-xs text-amber-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          Awaiting host response. You can request another change after this one is resolved.
        </div>
      )}

      {/* Request form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-3 bg-violet-50 rounded-xl border border-violet-100 space-y-3">
          <p className="text-xs font-medium text-gray-700">New dates</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">Check-in</label>
              <Input type="date" value={newCheckIn} min={today} onChange={(e) => { setNewCheckIn(e.target.value); if (newCheckOut && e.target.value >= newCheckOut) setNewCheckOut(""); }} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">Check-out</label>
              <Input type="date" value={newCheckOut} min={newCheckIn || today} onChange={(e) => setNewCheckOut(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <Input type="text" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="h-8 text-xs" />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting} className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8">
              {submitting ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Sending…</> : "Send request"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs h-8">Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
