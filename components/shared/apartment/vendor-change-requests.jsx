"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function VendorChangeRequests({ bookingId, onResolved }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);
  const [vendorNote, setVendorNote] = useState("");

  useEffect(() => {
    fetch(`/api/bookings/apartment/${bookingId}/change-request`)
      .then((r) => r.json())
      .then((d) => setRequests(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  const pending = requests.filter((r) => r.status === "pending");

  const resolve = async (requestId, status) => {
    setResolving(requestId + status);
    try {
      const res = await fetch(`/api/bookings/apartment/${bookingId}/change-request`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, status, vendor_note: vendorNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(status === "approved" ? "Dates updated and guest notified" : "Request declined");
      setRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status, vendor_note: vendorNote, resolved_at: new Date().toISOString() } : r));
      setVendorNote("");
      onResolved?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResolving(null);
    }
  };

  if (loading) return <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-gray-300" /></div>;
  if (pending.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-medium text-amber-700 flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {pending.length} date change request{pending.length > 1 ? "s" : ""} pending
      </p>
      {pending.map((req) => (
        <div key={req.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm space-y-3">
          <div>
            <p className="font-medium text-gray-800">
              Guest requests: {format(parseISO(req.new_check_in), "d MMM yyyy")} → {format(parseISO(req.new_check_out), "d MMM yyyy")}
            </p>
            {req.reason && <p className="text-xs text-gray-500 mt-0.5">Reason: {req.reason}</p>}
          </div>
          <input
            type="text"
            placeholder="Optional note to guest"
            value={vendorNote}
            onChange={(e) => setVendorNote(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-violet-400 outline-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => resolve(req.id, "approved")}
              disabled={!!resolving}
              className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 flex items-center gap-1"
            >
              {resolving === req.id + "approved" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => resolve(req.id, "declined")}
              disabled={!!resolving}
              className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8 flex items-center gap-1"
            >
              {resolving === req.id + "declined" ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
