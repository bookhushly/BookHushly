"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Plus, Pencil, Trash2, TrendingUp, Tag } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const EMPTY_FORM = {
  name: "",
  start_date: "",
  end_date: "",
  adjustment_type: "percentage",
  adjustment_value: "",
};

export function HotelPricingTab({ hotelId }) {
  const supabase = createClient();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    loadRules();
  }, [hotelId]);

  const loadRules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hotel_pricing_rules")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("start_date");

    if (error) {
      toast.error("Failed to load pricing rules");
    } else {
      setRules(data || []);
    }
    setLoading(false);
  };

  const openDialog = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        start_date: rule.start_date,
        end_date: rule.end_date,
        adjustment_type: rule.adjustment_type,
        adjustment_value: String(rule.adjustment_value),
      });
    } else {
      setEditingRule(null);
      setFormData(EMPTY_FORM);
    }
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.start_date || !formData.end_date || !formData.adjustment_value) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error("End date must be on or after start date");
      return;
    }

    const adj = parseFloat(formData.adjustment_value);
    if (isNaN(adj) || adj <= 0) {
      toast.error("Adjustment value must be a positive number");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        hotel_id: hotelId,
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        adjustment_type: formData.adjustment_type,
        adjustment_value: adj,
      };

      if (editingRule) {
        const { error } = await supabase
          .from("hotel_pricing_rules")
          .update(payload)
          .eq("id", editingRule.id);
        if (error) throw error;
        toast.success("Pricing rule updated");
      } else {
        const { error } = await supabase
          .from("hotel_pricing_rules")
          .insert(payload);
        if (error) throw error;
        toast.success("Pricing rule created");
      }

      setDialogOpen(false);
      loadRules();
    } catch (err) {
      toast.error(err.message || "Failed to save pricing rule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this pricing rule?")) return;
    const { error } = await supabase
      .from("hotel_pricing_rules")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Failed to delete rule");
    } else {
      toast.success("Rule deleted");
      setRules((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const formatAdj = (rule) => {
    if (rule.adjustment_type === "percentage") {
      return `+${rule.adjustment_value}%`;
    }
    return `+₦${Number(rule.adjustment_value).toLocaleString("en-NG")}`;
  };

  const formatDateRange = (start, end) => {
    try {
      const s = format(new Date(start), "MMM d, yyyy");
      const e = format(new Date(end), "MMM d, yyyy");
      return s === e ? s : `${s} – ${e}`;
    } catch {
      return `${start} – ${end}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Seasonal Pricing Rules
                </CardTitle>
                <CardDescription>
                  Set price mark-ups for holidays, peak seasons, or special events. Guests will
                  see the adjusted price when booking within a rule&apos;s date range.
                </CardDescription>
              </div>
              <Button
                onClick={() => openDialog()}
                className="bg-purple-600 hover:bg-purple-700 shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-center py-10">
                <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Tag className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No pricing rules yet. Add rules for public holidays, peak seasons, or events.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{rule.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateRange(rule.start_date, rule.end_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                        {formatAdj(rule)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openDialog(rule)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-5 pb-4">
            <p className="text-sm text-amber-800">
              <span className="font-medium">How it works:</span> When a guest books within a rule&apos;s date
              range, each night&apos;s price is increased by the rule&apos;s adjustment. If multiple rules
              overlap, the largest adjustment wins. Base prices remain unchanged outside rule windows.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit dialog */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingRule ? "Edit Pricing Rule" : "New Pricing Rule"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Christmas Holiday, Eid el-Fitr, Easter"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adjustment Type *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.adjustment_type === "percentage"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="adjustment_type"
                      value="percentage"
                      checked={formData.adjustment_type === "percentage"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-medium text-sm">Percentage (%)</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.adjustment_type === "fixed"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="adjustment_type"
                      value="fixed"
                      checked={formData.adjustment_type === "fixed"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-medium text-sm">Fixed Amount (₦)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment_value">
                  {formData.adjustment_type === "percentage"
                    ? "Percentage Increase *"
                    : "Amount to Add per Night (₦) *"}
                </Label>
                <Input
                  id="adjustment_value"
                  name="adjustment_value"
                  type="text"
                  inputMode="decimal"
                  placeholder={formData.adjustment_type === "percentage" ? "e.g., 30" : "e.g., 5000"}
                  value={formData.adjustment_value}
                  onChange={handleChange}
                  required
                />
                {formData.adjustment_value && !isNaN(parseFloat(formData.adjustment_value)) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.adjustment_type === "percentage"
                      ? `Prices will be ${formData.adjustment_value}% higher during this period`
                      : `₦${Number(formData.adjustment_value).toLocaleString("en-NG")} will be added to each night`}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : editingRule ? (
                    "Update Rule"
                  ) : (
                    "Create Rule"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
