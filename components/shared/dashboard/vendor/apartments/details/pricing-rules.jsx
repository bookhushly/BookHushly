"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, Loader2, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function PricingRules({ apartmentId, basePrice }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    fetch(`/api/vendor/apartments/pricing-rules?apartment_id=${apartmentId}`)
      .then((r) => r.json())
      .then((d) => setRules(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apartmentId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!label.trim() || !startDate || !endDate || !price) {
      toast.error("Please fill in all fields");
      return;
    }
    if (parseFloat(price) <= 0) {
      toast.error("Price must be greater than zero");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendor/apartments/pricing-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartment_id: apartmentId,
          label,
          start_date: startDate,
          end_date: endDate,
          price_per_night: parseFloat(price),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setRules((prev) => [...prev, data.data].sort((a, b) => a.start_date.localeCompare(b.start_date)));
      setShowForm(false);
      setLabel(""); setStartDate(""); setEndDate(""); setPrice("");
      toast.success("Pricing rule added");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rule) => {
    setDeletingId(rule.id);
    try {
      const res = await fetch(
        `/api/vendor/apartments/pricing-rules?id=${rule.id}&apartment_id=${apartmentId}`,
        { method: "DELETE" }
      );
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      toast.success("Rule removed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-violet-500" />
          Seasonal / special pricing
        </h3>
        {!showForm && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 border-violet-200 text-violet-700 hover:bg-violet-50"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add rule
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Base price: ₦{parseFloat(basePrice || 0).toLocaleString()}/night.
        Rules override the base price for specific date ranges.
      </p>

      {rules.length === 0 && !showForm && (
        <p className="text-xs text-gray-400 italic">No pricing rules yet.</p>
      )}

      {rules.map((rule) => (
        <div key={rule.id} className="flex items-start justify-between gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100 text-sm">
          <div className="flex items-start gap-2 min-w-0">
            <CalendarRange className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">{rule.label}</p>
              <p className="text-xs text-gray-500">
                {format(parseISO(rule.start_date), "d MMM yyyy")} –{" "}
                {format(parseISO(rule.end_date), "d MMM yyyy")}
              </p>
              <p className="text-xs font-medium text-violet-700 mt-0.5">
                ₦{parseFloat(rule.price_per_night).toLocaleString()}/night
                {basePrice && parseFloat(rule.price_per_night) > parseFloat(basePrice) && (
                  <span className="text-green-600 ml-1">
                    (+{Math.round(((rule.price_per_night - basePrice) / basePrice) * 100)}%)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDelete(rule)}
            disabled={deletingId === rule.id}
            className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"
          >
            {deletingId === rule.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      ))}

      {showForm && (
        <form onSubmit={handleAdd} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
          <p className="text-xs font-semibold text-gray-700">New pricing rule</p>
          <Input
            placeholder="Label (e.g. Christmas, Easter, Peak season)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-gray-500 mb-0.5 block">Start date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-0.5 block">End date</label>
              <Input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 mb-0.5 block">Price per night (₦)</label>
            <Input
              type="number"
              placeholder="e.g. 50000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={1}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting} className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8">
              {submitting ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Saving…</> : "Save rule"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs h-8">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
