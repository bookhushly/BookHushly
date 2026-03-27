"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Loader2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const TYPE_LABELS = { damage: "Damage claim", refund: "Refund request", service: "Service issue", other: "Other" };
const STATUS_STYLES = {
  open: "bg-red-50 text-red-700 border-red-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function BookingDispute({ bookingId, bookingStatus }) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("refund");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canRaise = !["pending", "pending_payment"].includes(bookingStatus);

  useEffect(() => {
    fetch(`/api/bookings/apartment/${bookingId}/dispute`)
      .then((r) => r.json())
      .then((d) => setDisputes(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) { toast.error("Please describe the issue"); return; }
    if (description.length < 10) { toast.error("Description too short (min 10 chars)"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/apartment/${bookingId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, description, amount_claimed: amount ? parseFloat(amount) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      toast.success("Dispute raised. Our team will review within 24–48 hours.");
      setDisputes((prev) => [data.data, ...prev]);
      setShowForm(false);
      setDescription(""); setAmount("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-red-400" />
          Issues & disputes
        </p>
        {canRaise && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
          >
            Raise issue →
          </button>
        )}
      </div>

      {disputes.map((d) => (
        <div key={d.id} className={`p-3 rounded-xl border text-xs ${STATUS_STYLES[d.status]}`}>
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className="font-semibold capitalize">{TYPE_LABELS[d.type] || d.type} — {d.status.replace("_", " ")}</p>
              <p className="mt-0.5 opacity-80 line-clamp-2">{d.description}</p>
              {d.amount_claimed && <p className="mt-0.5 font-medium">Claimed: ₦{parseFloat(d.amount_claimed).toLocaleString()}</p>}
              {d.resolution_note && <p className="mt-1 italic border-t border-current/20 pt-1">Resolution: {d.resolution_note}</p>}
            </div>
            <span className="text-[10px] text-gray-400 shrink-0">{format(parseISO(d.created_at), "d MMM")}</span>
          </div>
        </div>
      ))}

      {showForm && (
        <form onSubmit={handleSubmit} className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-3">
          <p className="text-xs font-semibold text-gray-700">Describe your issue</p>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-400 outline-none"
          >
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue in detail (min 10 characters)"
            rows={3}
            maxLength={3000}
            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-red-400 outline-none resize-none"
          />
          <Input
            type="number"
            placeholder="Amount claimed (₦) — leave blank if not applicable"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            className="h-8 text-xs"
          />
          <div className="flex items-start gap-1.5 text-[11px] text-amber-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Our team will review your dispute and respond within 24–48 hours. Do not initiate a chargeback before contacting us.
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white text-xs h-8">
              {submitting ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Submitting…</> : "Submit dispute"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs h-8">Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}
