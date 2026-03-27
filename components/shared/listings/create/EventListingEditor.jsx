"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createListing } from "@/app/actions/listings";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/common/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Info,
  Ticket,
  Camera,
  Settings2,
  Rocket,
  Plus,
  Trash2,
  Copy,
  Globe,
  Lock,
  FileEdit,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Tag,
  HelpCircle,
  Loader2,
  X,
  Save,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { value: "wedding", label: "Wedding" },
  { value: "owambe", label: "Owambe / Social Party" },
  { value: "naming_ceremony", label: "Naming Ceremony" },
  { value: "engagement", label: "Engagement / Introduction" },
  { value: "burial_thanksgiving", label: "Burial / Thanksgiving" },
  { value: "concert", label: "Concert / Show" },
  { value: "conference", label: "Conference / Seminar" },
  { value: "birthday", label: "Birthday Party" },
  { value: "corporate", label: "Corporate Event" },
  { value: "social", label: "Social Gathering" },
  { value: "product_launch", label: "Product Launch" },
  { value: "religious", label: "Religious Programme" },
];

const TABS = [
  { id: "basic", label: "Basic Info", icon: Info },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "media", label: "Media", icon: Camera },
  { id: "settings", label: "Settings", icon: Settings2 },
  { id: "publish", label: "Publish", icon: Rocket },
];

const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Public",
    desc: "Visible to everyone in search results",
    icon: Globe,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  {
    value: "private",
    label: "Private",
    desc: "Accessible via direct link only — not in search",
    icon: Lock,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  {
    value: "draft",
    label: "Draft",
    desc: "Saved but not yet published — only you can see it",
    icon: FileEdit,
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  },
];

const QUESTION_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
];

const MAX_IMAGES = 5;
const MAX_TICKETS = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tabComplete(tab, formData, tickets, useMultiplePackages, totalImages) {
  switch (tab) {
    case "basic":
      return !!(
        formData.title &&
        formData.description &&
        (formData.location || formData.is_online) &&
        formData.event_date &&
        formData.event_time &&
        formData.event_types
      );
    case "tickets":
      return useMultiplePackages ? tickets.length > 0 : !!formData.price;
    case "media":
      return totalImages > 0;
    case "settings":
      return true; // optional tab
    default:
      return false;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TabNav({ activeTab, setActiveTab, formData, tickets, useMultiplePackages, totalImages }) {
  return (
    <div className="flex overflow-x-auto border-b border-gray-200 mb-8 -mx-1 px-1 gap-1 no-scrollbar">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const done =
          tab.id !== "publish" &&
          tabComplete(tab.id, formData, tickets, useMultiplePackages, totalImages);
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              isActive
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {done && !isActive ? (
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <Icon className="w-4 h-4 shrink-0" />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

// ─── Basic Info Tab ───────────────────────────────────────────────────────────

function BasicInfoTab({ formData, setFormData, errors, eventType }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-1">Event Details</h2>
        <p className="text-sm text-gray-500">
          Fill in the core information about your event. You can come back and edit these at any time before publishing.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="font-medium">
          Event Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title || ""}
          onChange={handleChange}
          placeholder="e.g., Lagos Tech Summit 2025"
          maxLength={100}
          className={errors.title ? "border-red-500" : ""}
        />
        <div className="flex justify-between">
          <FieldError msg={errors.title} />
          <span className="text-xs text-gray-400 ml-auto">
            {(formData.title || "").length}/100
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="font-medium">
          Description <span className="text-red-500">*</span>
        </Label>
        <div className={errors.description ? "ring-1 ring-red-500 rounded-lg" : ""}>
          <RichTextEditor
            content={formData.description || ""}
            onChange={(html) => setFormData((p) => ({ ...p, description: html }))}
            placeholder="Describe your event — what to expect, who should attend, what makes it special..."
            minHeight="180px"
            showWordCount
          />
        </div>
        <FieldError msg={errors.description} />
      </div>

      {/* Virtual event toggle */}
      <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
        <button
          type="button"
          role="switch"
          aria-checked={!!formData.is_online}
          onClick={() => setFormData((p) => ({ ...p, is_online: !p.is_online }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.is_online ? "bg-purple-600" : "bg-gray-300"
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            formData.is_online ? "translate-x-6" : "translate-x-1"
          }`} />
        </button>
        <div>
          <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
            <Globe className="w-4 h-4 text-purple-500" />
            Virtual / Online Event
          </p>
          <p className="text-xs text-gray-500">Attendees will receive the stream link after booking</p>
        </div>
      </div>

      {formData.is_online && (
        <div className="space-y-1.5">
          <Label htmlFor="stream_url" className="font-medium">
            Stream / Join Link
          </Label>
          <Input
            id="stream_url"
            name="stream_url"
            type="url"
            value={formData.stream_url || ""}
            onChange={handleChange}
            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
          />
          <p className="text-xs text-gray-400">Only revealed to confirmed attendees. Keep this private until then.</p>
        </div>
      )}

      {/* Location */}
      <div className="space-y-1.5">
        <Label htmlFor="location" className="font-medium">
          <MapPin className="inline w-4 h-4 mr-1 text-gray-400" />
          {formData.is_online ? "Location (optional)" : <>Location <span className="text-red-500">*</span></>}
        </Label>
        <Input
          id="location"
          name="location"
          value={formData.location || ""}
          onChange={handleChange}
          placeholder={formData.is_online ? "e.g., Online (Zoom)" : "e.g., Eko Hotel & Suites, Victoria Island, Lagos"}
          className={errors.location ? "border-red-500" : ""}
        />
        <FieldError msg={errors.location} />
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="event_date" className="font-medium">
            <Calendar className="inline w-4 h-4 mr-1 text-gray-400" />
            Event Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="event_date"
            name="event_date"
            type="date"
            value={formData.event_date || ""}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className={errors.event_date ? "border-red-500" : ""}
          />
          <FieldError msg={errors.event_date} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="event_time" className="font-medium">
            <Clock className="inline w-4 h-4 mr-1 text-gray-400" />
            Start Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="event_time"
            name="event_time"
            type="time"
            value={formData.event_time || ""}
            onChange={handleChange}
            className={errors.event_time ? "border-red-500" : ""}
          />
          <FieldError msg={errors.event_time} />
        </div>
      </div>

      {/* End Date (multi-day) */}
      <div className="space-y-1.5">
        <Label htmlFor="event_end_date" className="font-medium">
          <Calendar className="inline w-4 h-4 mr-1 text-gray-400" />
          End Date <span className="text-xs font-normal text-gray-400">(optional — leave blank for single-day)</span>
        </Label>
        <Input
          id="event_end_date"
          name="event_end_date"
          type="date"
          value={formData.event_end_date || ""}
          onChange={handleChange}
          min={formData.event_date || new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Event Type */}
      <div className="space-y-1.5">
        <Label className="font-medium">
          Event Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.event_types || ""}
          onValueChange={(v) => setFormData((p) => ({ ...p, event_types: v }))}
        >
          <SelectTrigger className={errors.event_types ? "border-red-500" : ""}>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError msg={errors.event_types} />
      </div>

      {/* Aso-ebi */}
      <div className="space-y-1.5">
        <Label className="font-medium">Aso-ebi Available?</Label>
        <Select
          value={formData.asoebi_available || "no"}
          onValueChange={(v) =>
            setFormData((p) => ({ ...p, asoebi_available: v }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="yes">Yes — Contact Organizer</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Tickets Tab ──────────────────────────────────────────────────────────────

function TicketsTab({
  formData,
  setFormData,
  tickets,
  setTickets,
  useMultiplePackages,
  setUseMultiplePackages,
  errors,
  lowStockThreshold,
  setLowStockThreshold,
}) {
  const [tempTicket, setTempTicket] = useState({
    name: "",
    price: "",
    quantity: "",
    description: "",
    early_bird_price: "",
    early_bird_end: "",
    sale_starts_at: "",
    sale_ends_at: "",
    min_per_order: "",
    max_per_order: "",
    is_hidden: false,
    access_code: "",
  });
  const [showEarlyBird, setShowEarlyBird] = useState(false);
  const [showSaleWindow, setShowSaleWindow] = useState(false);

  const totalTickets = tickets.reduce(
    (s, t) => s + parseInt(t.quantity || 0),
    0
  );

  const addTicket = () => {
    // Allow price = "0" for free tickets; only block an empty string
    if (!tempTicket.name || tempTicket.price === "" || !tempTicket.quantity) return;
    if (tickets.length >= MAX_TICKETS) return;
    setTickets((prev) => [
      ...prev,
      {
        ...tempTicket,
        remaining: tempTicket.quantity,
        early_bird_price: tempTicket.early_bird_price || null,
        early_bird_end: tempTicket.early_bird_end || null,
        sale_starts_at: tempTicket.sale_starts_at || null,
        sale_ends_at: tempTicket.sale_ends_at || null,
        min_per_order: tempTicket.min_per_order ? parseInt(tempTicket.min_per_order) : 1,
        max_per_order: tempTicket.max_per_order ? parseInt(tempTicket.max_per_order) : null,
        is_hidden: !!tempTicket.is_hidden,
        access_code: tempTicket.is_hidden ? (tempTicket.access_code || null) : null,
      },
    ]);
    setTempTicket({
      name: "",
      price: "",
      quantity: "",
      description: "",
      early_bird_price: "",
      early_bird_end: "",
      sale_starts_at: "",
      sale_ends_at: "",
      min_per_order: "",
      max_per_order: "",
      is_hidden: false,
      access_code: "",
    });
    setShowEarlyBird(false);
    setShowSaleWindow(false);
  };

  const removeTicket = (i) => setTickets((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-1">Ticket Setup</h2>
        <p className="text-sm text-gray-500">
          Set a single price or create multiple ticket tiers. Add early bird pricing to drive early sales.
        </p>
      </div>

      {/* Toggle: single vs multiple */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setUseMultiplePackages(false)}
          className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
            !useMultiplePackages
              ? "border-purple-600 bg-purple-50 text-purple-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          Single Price
        </button>
        <button
          type="button"
          onClick={() => setUseMultiplePackages(true)}
          className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
            useMultiplePackages
              ? "border-purple-600 bg-purple-50 text-purple-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          Multiple Ticket Tiers
        </button>
      </div>

      {!useMultiplePackages && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-medium">
                Ticket Price (₦) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, price: e.target.value }))
                }
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              <FieldError msg={errors.price} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-medium">Total Tickets Available</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formData.total_tickets || ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, total_tickets: e.target.value }))
                }
                placeholder="e.g., 500"
              />
            </div>
          </div>
        </div>
      )}

      {useMultiplePackages && (
        <div className="space-y-4">
          {/* Existing packages */}
          {tickets.length > 0 && (
            <div className="space-y-3">
              {tickets.map((ticket, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-xl bg-white"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{ticket.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {parseInt(ticket.quantity).toLocaleString()} tickets
                      </Badge>
                      {ticket.early_bird_price && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                          Early Bird: ₦{parseFloat(ticket.early_bird_price).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    {ticket.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{ticket.description}</p>
                    )}
                    <p className="text-sm font-medium text-purple-700 mt-1">
                      ₦{parseFloat(ticket.price).toLocaleString()} per ticket
                    </p>
                    {ticket.early_bird_end && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        Early bird ends: {new Date(ticket.early_bird_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTicket(i)}
                    className="text-red-400 hover:text-red-600 ml-4 mt-0.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <p className="text-sm text-gray-600 font-medium">
                Total: {totalTickets.toLocaleString()} tickets across {tickets.length} tier{tickets.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          {tickets.length < MAX_TICKETS && (
            <div className="space-y-4 p-5 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <h4 className="font-medium text-gray-800">Add Ticket Tier</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Name *</Label>
                  <Input
                    value={tempTicket.name}
                    onChange={(e) =>
                      setTempTicket((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g., VIP, Regular"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Price (₦) *</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={tempTicket.price}
                    onChange={(e) =>
                      setTempTicket((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Quantity *</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={tempTicket.quantity}
                    onChange={(e) =>
                      setTempTicket((p) => ({ ...p, quantity: e.target.value }))
                    }
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Description (optional)</Label>
                <Input
                  value={tempTicket.description}
                  onChange={(e) =>
                    setTempTicket((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="What's included — e.g., seat + dinner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Min per order (optional)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={tempTicket.min_per_order}
                    onChange={(e) =>
                      setTempTicket((p) => ({ ...p, min_per_order: e.target.value }))
                    }
                    placeholder="1"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Max per order (optional)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={tempTicket.max_per_order}
                    onChange={(e) =>
                      setTempTicket((p) => ({ ...p, max_per_order: e.target.value }))
                    }
                    placeholder="No limit"
                  />
                </div>
              </div>

              {/* Hidden ticket toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!tempTicket.is_hidden}
                  onClick={() => setTempTicket((p) => ({ ...p, is_hidden: !p.is_hidden }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    tempTicket.is_hidden ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    tempTicket.is_hidden ? "translate-x-5" : "translate-x-1"
                  }`} />
                </button>
                <span className="text-sm text-gray-700 font-medium">Hidden ticket (requires access code)</span>
              </div>

              {tempTicket.is_hidden && (
                <div className="space-y-1 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <Label className="text-xs font-medium text-purple-800">Access Code</Label>
                  <Input
                    value={tempTicket.access_code}
                    onChange={(e) => setTempTicket((p) => ({ ...p, access_code: e.target.value }))}
                    placeholder="e.g., BACKSTAGE2025"
                    className="border-purple-300 focus-visible:ring-purple-400"
                  />
                  <p className="text-xs text-purple-600">Attendees must enter this code to reveal and purchase this tier.</p>
                </div>
              )}

              {/* Early bird toggle */}
              <button
                type="button"
                onClick={() => setShowEarlyBird((p) => !p)}
                className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                <Tag className="w-4 h-4" />
                {showEarlyBird ? "Remove early bird pricing" : "+ Add early bird pricing"}
              </button>

              {showEarlyBird && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-amber-800">
                      Early Bird Price (₦)
                    </Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={tempTicket.early_bird_price}
                      onChange={(e) =>
                        setTempTicket((p) => ({
                          ...p,
                          early_bird_price: e.target.value,
                        }))
                      }
                      placeholder="Discounted price"
                      className="border-amber-300 focus-visible:ring-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-amber-800">
                      Early Bird Ends
                    </Label>
                    <Input
                      type="date"
                      value={tempTicket.early_bird_end}
                      onChange={(e) =>
                        setTempTicket((p) => ({
                          ...p,
                          early_bird_end: e.target.value,
                        }))
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="border-amber-300 focus-visible:ring-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Sale window toggle */}
              <button
                type="button"
                onClick={() => setShowSaleWindow((p) => !p)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Clock className="w-4 h-4" />
                {showSaleWindow ? "Remove sale window" : "+ Set sale window (optional)"}
              </button>

              {showSaleWindow && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-blue-800">
                      Sales Start
                    </Label>
                    <Input
                      type="datetime-local"
                      value={tempTicket.sale_starts_at}
                      onChange={(e) =>
                        setTempTicket((p) => ({ ...p, sale_starts_at: e.target.value }))
                      }
                      className="border-blue-300 focus-visible:ring-blue-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-blue-800">
                      Sales End
                    </Label>
                    <Input
                      type="datetime-local"
                      value={tempTicket.sale_ends_at}
                      onChange={(e) =>
                        setTempTicket((p) => ({ ...p, sale_ends_at: e.target.value }))
                      }
                      className="border-blue-300 focus-visible:ring-blue-400"
                    />
                  </div>
                  <p className="text-xs text-blue-600 col-span-full">
                    Leave blank to sell from now until the event. Attendees will see "Sales not yet open" or "Sales ended" outside this window.
                  </p>
                </div>
              )}

              <Button
                type="button"
                onClick={addTicket}
                disabled={
                  !tempTicket.name || !tempTicket.price || !tempTicket.quantity
                }
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ticket Tier
              </Button>
            </div>
          )}

          <FieldError msg={errors.tickets} />
        </div>
      )}

      {/* Low stock alert threshold */}
      <div className="pt-4 border-t border-gray-100 space-y-1.5">
        <Label className="font-medium text-sm">
          Low stock alert threshold
        </Label>
        <p className="text-xs text-gray-500">
          Attendees see a &quot;Few tickets left&quot; warning when available tickets drop below this number. Leave at 50 if unsure.
        </p>
        <Input
          type="text"
          inputMode="numeric"
          value={formData.low_stock_threshold || "50"}
          onChange={(e) =>
            setFormData((p) => ({ ...p, low_stock_threshold: e.target.value }))
          }
          placeholder="50"
          className="max-w-[120px]"
        />
      </div>
    </div>
  );
}

// ─── Media Tab ────────────────────────────────────────────────────────────────

function MediaTab({ images, imagePreviews, onImageChange, errors, coverIndex, onSetCover }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-1">Event Photos</h2>
        <p className="text-sm text-gray-500">
          Upload up to 5 high-quality images. Click any image to set it as your cover photo.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
        <Camera className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm font-medium text-gray-600">
          Click to upload photos
        </span>
        <span className="text-xs text-gray-400 mt-1">
          PNG, JPG up to 10MB each — max {MAX_IMAGES} images
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onImageChange}
        />
      </label>

      <FieldError msg={errors.images} />

      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {imagePreviews.map((src, i) => {
            const isCover = i === coverIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSetCover(i)}
                className={`relative rounded-xl overflow-hidden aspect-video w-full focus:outline-none transition-all ${
                  isCover
                    ? "ring-4 ring-purple-600 ring-offset-2"
                    : "ring-2 ring-transparent hover:ring-gray-300"
                }`}
                title={isCover ? "Current cover" : "Set as cover"}
              >
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {isCover ? (
                  <div className="absolute top-2 left-2">
                    <Badge className="text-xs bg-purple-600">Cover</Badge>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-lg">
                      Set as cover
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {imagePreviews.length > 0 && (
        <p className="text-xs text-gray-400">
          Cover photo: image {coverIndex + 1} of {imagePreviews.length}
        </p>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

const AGE_OPTIONS = [
  { value: "all", label: "All ages welcome", desc: "No age restriction" },
  { value: "16", label: "16 and above", desc: "Attendees must be 16+" },
  { value: "18", label: "18 and above", desc: "Attendees must be 18+" },
  { value: "21", label: "21 and above", desc: "Attendees must be 21+" },
];

function SettingsTab({ visibility, setVisibility, ageRestriction, setAgeRestriction, customQuestions, setCustomQuestions, recurrence, setRecurrence }) {
  const [newQuestion, setNewQuestion] = useState({
    label: "",
    type: "text",
    required: false,
    options: "",
  });

  const addQuestion = () => {
    if (!newQuestion.label.trim()) return;
    const q = {
      id: `q_${Date.now()}`,
      label: newQuestion.label.trim(),
      type: newQuestion.type,
      required: newQuestion.required,
      options:
        newQuestion.type === "select"
          ? newQuestion.options
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : [],
    };
    setCustomQuestions((prev) => [...prev, q]);
    setNewQuestion({ label: "", type: "text", required: false, options: "" });
  };

  const removeQuestion = (id) =>
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));

  return (
    <div className="space-y-8">
      {/* Visibility */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-1">Visibility</h2>
          <p className="text-sm text-gray-500">
            Control who can discover and access your event.
          </p>
        </div>

        <div className="space-y-3">
          {VISIBILITY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = visibility === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVisibility(opt.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? `${opt.bg} border-current ${opt.color}`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isSelected ? opt.color : "text-gray-400"}`} />
                <div>
                  <p className={`font-medium text-sm ${isSelected ? opt.color : "text-gray-700"}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                </div>
                {isSelected && (
                  <CheckCircle className={`w-5 h-5 ml-auto shrink-0 ${opt.color}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Age Restriction */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-1">Age Restriction</h2>
          <p className="text-sm text-gray-500">
            Set the minimum age for attendees. This will be shown on your event listing and at checkout.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {AGE_OPTIONS.map((opt) => {
            const selected = ageRestriction === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAgeRestriction(opt.value)}
                className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? "border-brand-600 bg-brand-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className={`text-sm font-medium ${selected ? "text-brand-700" : "text-gray-700"}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">{opt.desc}</span>
                {selected && <CheckCircle className="w-4 h-4 text-brand-600 mt-1.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Attendee Questions */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-1">
            Custom Attendee Questions
          </h2>
          <p className="text-sm text-gray-500">
            Collect additional information from attendees at checkout — dietary requirements, t-shirt size, etc.
          </p>
        </div>

        {customQuestions.length > 0 && (
          <div className="space-y-2">
            {customQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {q.label}
                      {q.required && (
                        <span className="text-red-500 ml-1 text-xs">*required</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {QUESTION_TYPES.find((t) => t.value === q.type)?.label}
                      {q.options?.length > 0 && ` · ${q.options.join(", ")}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add question form */}
        <div className="space-y-3 p-4 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Question</Label>
              <Input
                value={newQuestion.label}
                onChange={(e) =>
                  setNewQuestion((p) => ({ ...p, label: e.target.value }))
                }
                placeholder="e.g., Dietary requirements"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Answer Type</Label>
              <Select
                value={newQuestion.type}
                onValueChange={(v) =>
                  setNewQuestion((p) => ({ ...p, type: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {newQuestion.type === "select" && (
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                Options (comma-separated)
              </Label>
              <Input
                value={newQuestion.options}
                onChange={(e) =>
                  setNewQuestion((p) => ({ ...p, options: e.target.value }))
                }
                placeholder="e.g., Vegan, Vegetarian, None"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={newQuestion.required}
                onChange={(e) =>
                  setNewQuestion((p) => ({
                    ...p,
                    required: e.target.checked,
                  }))
                }
                className="rounded border-gray-300"
              />
              Required question
            </label>
            <Button
              type="button"
              onClick={addQuestion}
              disabled={!newQuestion.label.trim()}
              size="sm"
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Question
            </Button>
          </div>
        </div>
      </div>

      {/* Recurring Event */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium text-gray-900 mb-1">Recurring Event</h2>
          <p className="text-sm text-gray-500">
            Mark this event as recurring so attendees can see upcoming dates.
          </p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setRecurrence((r) => ({ ...r, enabled: !r.enabled }))}
            className={`relative w-11 h-6 rounded-full transition-colors ${recurrence.enabled ? "bg-brand-600" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${recurrence.enabled ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">This event repeats</span>
        </label>
        {recurrence.enabled && (
          <div className="grid sm:grid-cols-2 gap-4 pl-1">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Frequency</Label>
              <div className="flex gap-2">
                {["weekly", "monthly"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRecurrence((r) => ({ ...r, type: t }))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all capitalize ${
                      recurrence.type === t
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recurrence_end" className="text-sm font-medium">Ends on (optional)</Label>
              <Input
                id="recurrence_end"
                type="date"
                value={recurrence.end_date}
                onChange={(e) => setRecurrence((r) => ({ ...r, end_date: e.target.value }))}
              />
              <p className="text-xs text-gray-400">Leave blank for open-ended recurrence</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Publish Tab ──────────────────────────────────────────────────────────────

function PublishTab({
  formData,
  tickets,
  useMultiplePackages,
  totalImages,
  visibility,
  customQuestions,
  eventType,
  vendor,
  onCopyPastEvent,
  onPublish,
  loading,
  uploadProgress,
  errors,
  isEditMode,
}) {
  const totalTickets = tickets.reduce(
    (s, t) => s + parseInt(t.quantity || 0),
    0
  );
  const lowestPrice = useMultiplePackages
    ? tickets.length > 0
      ? Math.min(...tickets.map((t) => parseFloat(t.early_bird_price || t.price)))
      : 0
    : parseFloat(formData.price || 0);

  const visOpt = VISIBILITY_OPTIONS.find((v) => v.value === visibility);

  const checks = [
    { label: "Event name", ok: !!formData.title },
    { label: "Description", ok: !!formData.description },
    { label: "Location", ok: !!formData.location },
    { label: "Date & time", ok: !!(formData.event_date && formData.event_time) },
    { label: "Event type", ok: !!formData.event_types },
    {
      label: "Tickets",
      ok: useMultiplePackages ? tickets.length > 0 : !!formData.price,
    },
    { label: "At least 1 photo", ok: totalImages > 0 },
  ];

  const allReady = checks.every((c) => c.ok);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-1">
          {isEditMode ? "Review & Save Changes" : "Ready to Publish?"}
        </h2>
        <p className="text-sm text-gray-500">
          {isEditMode
            ? "Review your changes before saving."
            : "Review your event details before making it live."}
        </p>
      </div>

      {/* Readiness checklist */}
      <div className="space-y-2">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-3 text-sm">
            {c.ok ? (
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className={c.ok ? "text-gray-700" : "text-red-500"}>
              {c.label}
            </span>
          </div>
        ))}
      </div>

      {/* Summary card */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-gray-900 text-lg leading-tight">
              {formData.title || "—"}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{formData.location || "—"}</p>
          </div>
          {visOpt && (
            <Badge
              className={`${visOpt.bg} ${visOpt.color} border shrink-0 text-xs`}
            >
              {visOpt.label}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
            <p className="font-medium text-gray-800">
              {formData.event_date
                ? new Date(formData.event_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Time</p>
            <p className="font-medium text-gray-800">{formData.event_time || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Tickets</p>
            <p className="font-medium text-gray-800">
              {useMultiplePackages
                ? `${totalTickets.toLocaleString()} across ${tickets.length} tier${tickets.length !== 1 ? "s" : ""}`
                : formData.total_tickets
                ? `${parseInt(formData.total_tickets).toLocaleString()} tickets`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Starting from</p>
            <p className="font-medium text-purple-700">
              {lowestPrice > 0 ? `₦${lowestPrice.toLocaleString()}` : "Free"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Camera className="w-4 h-4 text-gray-400" />
          {totalImages} photo{totalImages !== 1 ? "s" : ""} uploaded
          {customQuestions.length > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <HelpCircle className="w-4 h-4 text-gray-400" />
              {customQuestions.length} attendee question{customQuestions.length !== 1 ? "s" : ""}
            </>
          )}
        </div>
      </div>

      {/* Upload progress */}
      {loading && uploadProgress > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-purple-700 font-medium">
            {uploadProgress < 50
              ? "Uploading photos..."
              : uploadProgress < 90
              ? "Creating event..."
              : "Finalizing..."}
            {" "}{uploadProgress}%
          </p>
          <div className="w-full bg-purple-100 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {errors.global && (
        <Alert variant="destructive">
          <AlertDescription>{errors.global}</AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!isEditMode && (
          <Button
            type="button"
            variant="outline"
            onClick={onCopyPastEvent}
            className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Copy className="w-4 h-4" />
            Copy from Past Event
          </Button>
        )}

        <Button
          type="submit"
          disabled={!allReady || loading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3"
          onClick={onPublish}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditMode ? "Saving..." : "Publishing..."}
            </>
          ) : visibility === "draft" ? (
            <>
              <FileEdit className="w-4 h-4 mr-2" />
              {isEditMode ? "Save Changes" : "Save as Draft"}
            </>
          ) : (
            <>
              {isEditMode ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}
              {isEditMode ? "Save Changes" : "Publish Event"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Copy from Past Event Modal ───────────────────────────────────────────────

function CopyPastEventModal({ vendorId, onSelect, onClose }) {
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("listings")
        .select("id, title, event_date, ticket_packages, price, total_tickets, category_data")
        .eq("vendor_id", vendorId)
        .eq("category", "events")
        .order("created_at", { ascending: false })
        .limit(20);
      setEvents(data || []);
      setLoading(false);
    }
    load();
  }, [vendorId]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Copy from Past Event</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">
              No past events found.
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onSelect(ev)}
                  className="w-full text-left p-3 border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all"
                >
                  <p className="font-medium text-gray-900 text-sm">{ev.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ev.event_date
                      ? new Date(ev.event_date).toLocaleDateString()
                      : "No date"}
                    {" · "}
                    {ev.ticket_packages?.length > 0
                      ? `${ev.ticket_packages.length} ticket tier${ev.ticket_packages.length !== 1 ? "s" : ""}`
                      : ev.price
                      ? `₦${parseFloat(ev.price).toLocaleString()}`
                      : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventListingEditor({ vendor, user, eventType = "event_organizer", initialData = null, listingId = null }) {
  const isEditMode = !!listingId;
  const supabase = createClient();
  const router = useRouter();

  // ── Form State ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("basic");
  const [existingMediaUrls, setExistingMediaUrls] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    is_online: false,
    stream_url: "",
    event_date: "",
    event_end_date: "",
    event_time: "",
    event_types: "",
    asoebi_available: "no",
    price: "",
    total_tickets: "",
    low_stock_threshold: "50",
  });
  const [tickets, setTickets] = useState([]);
  const [useMultiplePackages, setUseMultiplePackages] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [visibility, setVisibility] = useState("public");
  const [ageRestriction, setAgeRestriction] = useState("all");
  const [customQuestions, setCustomQuestions] = useState([]);
  const [recurrence, setRecurrence] = useState({ enabled: false, type: "weekly", end_date: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // ── Draft persistence (create mode only) ───────────────────────────────────
  const draftKey = (!isEditMode && user?.id) ? `event-draft-${user.id}` : null;

  useEffect(() => {
    if (!draftKey) return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.formData) setFormData(p.formData);
        if (p.tickets) setTickets(p.tickets);
        if (p.useMultiplePackages != null) setUseMultiplePackages(p.useMultiplePackages);
        if (p.visibility) setVisibility(p.visibility);
        if (p.ageRestriction) setAgeRestriction(p.ageRestriction);
        if (p.customQuestions) setCustomQuestions(p.customQuestions);
        if (p.recurrence) setRecurrence(p.recurrence);
      }
    } catch {}
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || Object.keys(formData).every((k) => !formData[k])) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({ formData, tickets, useMultiplePackages, visibility, ageRestriction, customQuestions, recurrence })
        );
      } catch {}
    }, 800);
    return () => clearTimeout(id);
  }, [formData, tickets, useMultiplePackages, visibility, ageRestriction, customQuestions, recurrence, draftKey]);

  // ── Populate state from existing listing (edit mode or clone pre-fill) ──────
  useEffect(() => {
    if (!initialData) return;

    const rawDate = initialData.event_date;
    const eventDate = rawDate ? new Date(rawDate).toISOString().split("T")[0] : "";

    const rawTime = initialData.event_time;
    let eventTime = "";
    if (rawTime) {
      const d = new Date(rawTime);
      eventTime = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    }

    setFormData({
      title: initialData.title || "",
      description: initialData.description || "",
      location: initialData.location || "",
      is_online: initialData.category_data?.is_online || false,
      stream_url: initialData.category_data?.stream_url || "",
      event_date: eventDate,
      event_end_date: initialData.event_end_date ? new Date(initialData.event_end_date).toISOString().split("T")[0] : "",
      event_time: eventTime,
      event_types: initialData.category_data?.event_types || "",
      asoebi_available: initialData.category_data?.asoebi_available || "no",
      price: initialData.price?.toString() || "",
      total_tickets: initialData.total_tickets?.toString() || "",
      low_stock_threshold: String(initialData.category_data?.low_stock_threshold ?? 50),
    });

    if (initialData.ticket_packages?.length > 0) {
      setUseMultiplePackages(true);
      setTickets(
        initialData.ticket_packages.map((pkg) => ({
          name: pkg.name,
          price: String(pkg.price),
          quantity: String(pkg.total || pkg.remaining),
          description: pkg.description || "",
          early_bird_price: pkg.early_bird_price ? String(pkg.early_bird_price) : "",
          early_bird_end: pkg.early_bird_end || "",
        }))
      );
    }

    setVisibility(initialData.visibility || "public");
    setAgeRestriction(initialData.category_data?.age_restriction || "all");
    setCustomQuestions(Array.isArray(initialData.custom_questions) ? initialData.custom_questions : []);
    if (initialData.category_data?.recurrence) {
      setRecurrence(initialData.category_data.recurrence);
    }

    if (initialData.media_urls?.length > 0) {
      setExistingMediaUrls(initialData.media_urls);
      setImagePreviews(initialData.media_urls);
    }
  }, [initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Image handler ───────────────────────────────────────────────────────────
  const handleImageChange = useCallback((e) => {
    const newFiles = Array.from(e.target.files || []);
    if (isEditMode) {
      setImages((prev) => [...prev, ...newFiles].slice(0, MAX_IMAGES - existingMediaUrls.length));
      setImagePreviews((prev) => {
        const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
        return [...prev, ...newPreviews].slice(0, MAX_IMAGES);
      });
    } else {
      const files = newFiles.slice(0, MAX_IMAGES);
      setImages(files);
      setImagePreviews(files.map((f) => URL.createObjectURL(f)));
      setCoverIndex(0);
    }
    setErrors((p) => ({ ...p, images: undefined }));
  }, [isEditMode, existingMediaUrls.length]);

  // ── Validate & submit ───────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.title) errs.title = "Event name is required";
    if (!formData.description) errs.description = "Description is required";
    if (!formData.location) errs.location = "Location is required";
    if (!formData.event_date) errs.event_date = "Event date is required";
    if (!formData.event_time) errs.event_time = "Start time is required";
    if (!formData.event_types) errs.event_types = "Event type is required";
    if (images.length === 0 && existingMediaUrls.length === 0) errs.images = "At least one photo is required";
    if (useMultiplePackages && tickets.length === 0)
      errs.tickets = "Add at least one ticket tier";
    if (!useMultiplePackages && (!formData.price || parseFloat(formData.price) <= 0))
      errs.price = "Valid ticket price required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePublish = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      // Navigate to first tab with errors
      if (errors.title || errors.description || errors.location || errors.event_date || errors.event_time || errors.event_types)
        setActiveTab("basic");
      else if (errors.price || errors.tickets) setActiveTab("tickets");
      else if (errors.images) setActiveTab("media");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      setUploadProgress(10);

      // Upload images — cover first, then the rest in original order
      const orderedImages = [
        images[coverIndex],
        ...images.filter((_, i) => i !== coverIndex),
      ];
      const uploadPromises = orderedImages.map(async (img, i) => {
        const path = `${user.id}/${Date.now()}-${i}-${img.name}`;
        const { error } = await supabase.storage
          .from("listing-images")
          .upload(path, img, { cacheControl: "3600", upsert: false });
        if (error) throw new Error(`Upload failed: ${error.message}`);
        return supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl;
      });

      const mediaUrls = await Promise.all(uploadPromises);
      setUploadProgress(60);

      // Process tickets
      let processedTickets = null;
      let totalTickets = 0;
      let listingPrice = parseFloat(formData.price) || 0;

      if (useMultiplePackages && tickets.length > 0) {
        processedTickets = tickets.map((t) => ({
          name: t.name,
          price: parseFloat(t.price),
          total: parseInt(t.quantity),
          remaining: parseInt(t.quantity),
          description: t.description || "",
          early_bird_price: t.early_bird_price ? parseFloat(t.early_bird_price) : null,
          early_bird_end: t.early_bird_end || null,
        }));
        totalTickets = processedTickets.reduce((s, t) => s + t.total, 0);
        listingPrice = Math.min(
          ...processedTickets.map((t) =>
            t.early_bird_price != null ? t.early_bird_price : t.price
          )
        );
      } else {
        totalTickets = parseInt(formData.total_tickets) || 0;
      }

      setUploadProgress(80);

      const listingData = {
        vendor_id: vendor.id,
        vendor_name: vendor.business_name || "",
        vendor_phone: vendor.phone_number || "",
        category: "events",
        title: formData.title,
        description: formData.description,
        location: formData.location,
        event_date: formData.event_date,
        event_end_date: formData.event_end_date || null,
        event_time: formData.event_time,
        event_types: formData.event_types,
        asoebi_available: formData.asoebi_available || "no",
        price: listingPrice,
        total_tickets: totalTickets,
        remaining_tickets: totalTickets,
        ticket_packages: processedTickets || [],
        media_urls: mediaUrls,
        amenities: [],
        visibility,
        age_restriction: ageRestriction !== "all" ? ageRestriction : null,
        low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : 50,
        custom_questions: customQuestions,
        recurrence: recurrence.enabled ? recurrence : null,
        is_online: !!formData.is_online,
        stream_url: formData.is_online ? (formData.stream_url || null) : null,
        active: visibility !== "draft",
      };

      const result = await createListing(listingData);
      if (!result.success) throw new Error(result.error);

      setUploadProgress(100);
      if (draftKey) localStorage.removeItem(draftKey);

      toast.success(
        visibility === "draft" ? "Draft saved!" : "Event published!",
        {
          description:
            visibility === "draft"
              ? "You can publish it from your listings dashboard."
              : "Your event is now live and visible to attendees.",
        }
      );

      router.push("/vendor/dashboard/listings");
    } catch (err) {
      setErrors({ global: err.message || "Something went wrong. Please try again." });
      toast.error(err.message || "Failed to publish event");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ── Update existing listing (edit mode) ────────────────────────────────────
  const handleUpdate = async (e) => {
    e?.preventDefault();
    if (!validate()) {
      if (errors.title || errors.description || errors.location || errors.event_date || errors.event_time || errors.event_types)
        setActiveTab("basic");
      else if (errors.price || errors.tickets) setActiveTab("tickets");
      else if (errors.images) setActiveTab("media");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      setUploadProgress(10);

      // Upload only new File objects
      const newUploadedUrls = await Promise.all(
        images.map(async (img, i) => {
          const path = `${user.id}/${Date.now()}-${i}-${img.name}`;
          const { error } = await supabase.storage
            .from("listing-images")
            .upload(path, img, { cacheControl: "3600", upsert: false });
          if (error) throw new Error(`Upload failed: ${error.message}`);
          return supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl;
        })
      );

      // Reconstruct ordered URL list from imagePreviews (existing + new)
      const allUrls = imagePreviews.map((_, i) =>
        i < existingMediaUrls.length
          ? existingMediaUrls[i]
          : newUploadedUrls[i - existingMediaUrls.length]
      );
      const mediaUrls = [allUrls[coverIndex], ...allUrls.filter((_, i) => i !== coverIndex)];

      setUploadProgress(60);

      let processedTickets = [];
      let totalTickets = 0;
      let listingPrice = parseFloat(formData.price) || 0;

      if (useMultiplePackages && tickets.length > 0) {
        processedTickets = tickets.map((t) => ({
          name: t.name,
          price: parseFloat(t.price),
          total: parseInt(t.quantity),
          remaining: parseInt(t.quantity),
          description: t.description || "",
          early_bird_price: t.early_bird_price ? parseFloat(t.early_bird_price) : null,
          early_bird_end: t.early_bird_end || null,
        }));
        totalTickets = processedTickets.reduce((s, t) => s + t.total, 0);
        listingPrice = Math.min(
          ...processedTickets.map((t) => t.early_bird_price != null ? t.early_bird_price : t.price)
        );
      } else {
        totalTickets = parseInt(formData.total_tickets) || 0;
      }

      setUploadProgress(70);

      let eventTimestamp = null;
      if (formData.event_date && formData.event_time) {
        eventTimestamp = new Date(`${formData.event_date}T${formData.event_time}:00`).toISOString();
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        media_urls: mediaUrls,
        price: listingPrice,
        event_date: formData.event_date || null,
        event_end_date: formData.event_end_date || null,
        event_time: eventTimestamp,
        total_tickets: totalTickets,
        ticket_packages: processedTickets.length > 0 ? processedTickets : [],
        visibility,
        active: visibility !== "draft",
        custom_questions: customQuestions || [],
        category_data: {
          ...(initialData?.category_data || {}),
          event_types: formData.event_types || null,
          age_restriction: ageRestriction !== "all" ? ageRestriction : null,
          recurrence: recurrence.enabled ? recurrence : null,
          asoebi_available: formData.asoebi_available || null,
          low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : 50,
          is_online: !!formData.is_online,
          stream_url: formData.is_online ? (formData.stream_url || null) : null,
        },
      };

      setUploadProgress(80);

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update event");
      }

      setUploadProgress(100);
      toast.success("Event updated!", {
        description: visibility === "draft" ? "Draft saved." : "Your event has been updated.",
      });

      router.push("/vendor/dashboard/listings");
    } catch (err) {
      setErrors({ global: err.message || "Something went wrong. Please try again." });
      toast.error(err.message || "Failed to update event");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ── Copy from past event ────────────────────────────────────────────────────
  const handleCopySelect = (pastEvent) => {
    setFormData((p) => ({
      ...p,
      // Copy fields but NOT date/time (new event)
      description: pastEvent.description || p.description,
      location: pastEvent.location || p.location,
      event_types: pastEvent.category_data?.event_types || p.event_types,
      asoebi_available: pastEvent.asoebi_available || p.asoebi_available,
      price: pastEvent.price ? String(pastEvent.price) : p.price,
      total_tickets: pastEvent.total_tickets ? String(pastEvent.total_tickets) : p.total_tickets,
    }));

    if (pastEvent.ticket_packages?.length > 0) {
      setTickets(
        pastEvent.ticket_packages.map((pkg) => ({
          name: pkg.name,
          price: String(pkg.price),
          quantity: String(pkg.total || pkg.remaining),
          description: pkg.description || "",
          early_bird_price: pkg.early_bird_price ? String(pkg.early_bird_price) : "",
          early_bird_end: "",
          remaining: String(pkg.total || pkg.remaining),
        }))
      );
      setUseMultiplePackages(true);
    }

    setShowCopyModal(false);
    toast.success("Event details copied — update the date and name for your new event.");
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      <TabNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        tickets={tickets}
        useMultiplePackages={useMultiplePackages}
        totalImages={imagePreviews.length}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "basic" && (
            <BasicInfoTab
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              eventType={eventType}
            />
          )}
          {activeTab === "tickets" && (
            <TicketsTab
              formData={formData}
              setFormData={setFormData}
              tickets={tickets}
              setTickets={setTickets}
              useMultiplePackages={useMultiplePackages}
              setUseMultiplePackages={setUseMultiplePackages}
              errors={errors}
              lowStockThreshold={formData.low_stock_threshold}
              setLowStockThreshold={(v) => setFormData((p) => ({ ...p, low_stock_threshold: v }))}
            />
          )}
          {activeTab === "media" && (
            <MediaTab
              images={images}
              imagePreviews={imagePreviews}
              onImageChange={handleImageChange}
              errors={errors}
              coverIndex={coverIndex}
              onSetCover={setCoverIndex}
            />
          )}
          {activeTab === "settings" && (
            <SettingsTab
              visibility={visibility}
              setVisibility={setVisibility}
              ageRestriction={ageRestriction}
              setAgeRestriction={setAgeRestriction}
              customQuestions={customQuestions}
              setCustomQuestions={setCustomQuestions}
              recurrence={recurrence}
              setRecurrence={setRecurrence}
            />
          )}
          {activeTab === "publish" && (
            <PublishTab
              formData={formData}
              tickets={tickets}
              useMultiplePackages={useMultiplePackages}
              totalImages={imagePreviews.length}
              visibility={visibility}
              customQuestions={customQuestions}
              eventType={eventType}
              vendor={vendor}
              onCopyPastEvent={() => setShowCopyModal(true)}
              onPublish={isEditMode ? handleUpdate : handlePublish}
              loading={loading}
              uploadProgress={uploadProgress}
              errors={errors}
              isEditMode={isEditMode}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Tab navigation footer */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            const idx = TABS.findIndex((t) => t.id === activeTab);
            if (idx > 0) setActiveTab(TABS[idx - 1].id);
          }}
          disabled={activeTab === TABS[0].id}
          className="text-gray-600"
        >
          ← Previous
        </Button>

        {activeTab !== "publish" ? (
          <Button
            type="button"
            onClick={() => {
              const idx = TABS.findIndex((t) => t.id === activeTab);
              if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : null}
      </div>

      {showCopyModal && (
        <CopyPastEventModal
          vendorId={vendor.id}
          onSelect={handleCopySelect}
          onClose={() => setShowCopyModal(false)}
        />
      )}
    </div>
  );
}
