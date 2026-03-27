"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CalendarX,
  CalendarCheck,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  parseISO,
  addMonths,
  subMonths,
  getDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";

// ── helpers ──────────────────────────────────────────────────────────────────

function dateStr(d) {
  return format(d, "yyyy-MM-dd");
}

// Returns a list of single-night gap dates between blocked/booked ranges
function detectGapNights(blocked, booked) {
  // Collect all occupied date intervals
  const intervals = [
    ...blocked.map((b) => ({ start: b.start_date, end: b.end_date })),
    ...booked.map((b)  => ({ start: b.check_in_date, end: b.check_out_date })),
  ].sort((a, b) => a.start.localeCompare(b.start));

  const gaps = [];
  for (let i = 0; i < intervals.length - 1; i++) {
    const endOfCurrent = intervals[i].end;      // check-out / block end (exclusive end)
    const startOfNext  = intervals[i + 1].start;

    // Day after current end
    const dayAfter = new Date(endOfCurrent);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const dayAfterStr = dateStr(dayAfter);

    // Day before next start
    const dayBefore = new Date(startOfNext);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const dayBeforeStr = dateStr(dayBefore);

    // 1-night gap: dayAfter === dayBefore
    if (dayAfterStr === dayBeforeStr && dayAfterStr < startOfNext) {
      gaps.push(dayAfterStr);
    }
  }
  return gaps;
}

function dayStatus(day, blocked, booked) {
  const d = dateStr(day);
  for (const b of booked) {
    if (d >= b.check_in_date && d < b.check_out_date) {
      return { type: "booked", label: b.guest_name, item: b };
    }
  }
  for (const b of blocked) {
    const s = b.start_date;
    const e = b.end_date;
    if (d >= s && d <= e) {
      return { type: "blocked", label: b.reason || "Blocked", item: b };
    }
  }
  return { type: "available" };
}

// ── BlockList ─────────────────────────────────────────────────────────────────

function BlockList({ blocked, onDelete, deleting }) {
  if (!blocked.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Blocked ranges</p>
      {blocked.map((b) => (
        <div key={b.id} className="flex items-center justify-between p-2.5 bg-red-50 border border-red-100 rounded-lg text-sm">
          <div>
            <p className="font-medium text-gray-800">
              {format(parseISO(b.start_date), "d MMM yyyy")}
              {b.start_date !== b.end_date && (
                <> → {format(parseISO(b.end_date), "d MMM yyyy")}</>
              )}
            </p>
            {b.reason && <p className="text-xs text-gray-500 mt-0.5">{b.reason}</p>}
          </div>
          <button
            onClick={() => onDelete(b.id)}
            disabled={deleting === b.id}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors disabled:opacity-40"
          >
            {deleting === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      ))}
    </div>
  );
}

// ── AddBlockForm ──────────────────────────────────────────────────────────────

function AddBlockForm({ apartmentId, onAdded, onCancel }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const today = dateStr(new Date());

  const handleSave = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    if (endDate < startDate) {
      toast.error("End date must be on or after start date");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/apartments/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartment_id: apartmentId, start_date: startDate, end_date: endDate, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          toast.error(data.error);
        } else {
          throw new Error(data.error || "Failed to block dates");
        }
        return;
      }
      toast.success("Dates blocked successfully");
      onAdded();
    } catch (err) {
      toast.error(err.message || "Failed to block dates");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
      <p className="text-sm font-semibold text-gray-800">Block date range</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Start date</label>
          <Input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) setEndDate(e.target.value);
            }}
            className="h-9 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">End date</label>
          <Input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>
      <Input
        type="text"
        placeholder="Reason (e.g. maintenance, personal use)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-9 text-sm"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
          {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> Saving…</> : "Block dates"}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ── CalendarGrid ──────────────────────────────────────────────────────────────

function CalendarGrid({ month, blocked, booked, onDayClick }) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const startWeekday = getDay(start); // 0=Sun

  const today = startOfDay(new Date());

  return (
    <div>
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Leading empty cells */}
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const status = dayStatus(day, blocked, booked);
          const past = isBefore(day, today);
          const isTodays = isToday(day);

          let cellClass = "relative flex items-center justify-center rounded-lg text-[12px] font-medium h-9 cursor-pointer transition-colors ";
          if (past) {
            cellClass += "text-gray-300 cursor-default ";
          } else if (status.type === "booked") {
            cellClass += "bg-blue-100 text-blue-700 cursor-default ";
          } else if (status.type === "blocked") {
            cellClass += "bg-red-100 text-red-700 hover:bg-red-200 ";
          } else {
            cellClass += "text-gray-700 hover:bg-violet-50 hover:text-violet-700 ";
          }
          if (isTodays) cellClass += "ring-2 ring-violet-400 ring-offset-1 ";

          return (
            <button
              key={dateStr(day)}
              type="button"
              onClick={() => !past && onDayClick(day, status)}
              disabled={past}
              className={cellClass}
              title={status.label}
            >
              {format(day, "d")}
              {status.type === "blocked" && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
              )}
              {status.type === "booked" && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── iCal sync panel ───────────────────────────────────────────────────────────

function ICalPanel({ apartmentId, onImported }) {
  const [importing, setImporting] = useState(false);
  const fileRef = useState(null);

  const handleExport = () => {
    window.open(`/api/vendor/apartments/ical?apartment_id=${apartmentId}`, "_blank");
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("apartment_id", apartmentId);
      fd.append("file", file);
      const res = await fetch("/api/vendor/apartments/ical", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      toast.success(`Imported ${data.imported} event${data.imported !== 1 ? "s" : ""} as blocked dates`);
      onImported?.();
    } catch (err) {
      toast.error(err.message || "Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
      >
        <Download className="h-3.5 w-3.5" /> Export iCal
      </button>
      <label className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 cursor-pointer ${importing ? "opacity-50 cursor-not-allowed" : ""}`}>
        {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        Import iCal
        <input type="file" accept=".ics,text/calendar" className="hidden" disabled={importing} onChange={handleImport} />
      </label>
    </div>
  );
}

// ── Main CalendarTab ──────────────────────────────────────────────────────────

export default function CalendarTab({ apartmentId }) {
  const [month, setMonth] = useState(new Date());
  const [blocked, setBlocked] = useState([]);
  const [booked, setBooked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  const gapNights = useMemo(() => detectGapNights(blocked, booked), [blocked, booked]);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const y = month.getFullYear();
      const m = month.getMonth() + 1;
      const res = await fetch(
        `/api/vendor/apartments/blocked-dates?apartment_id=${apartmentId}&year=${y}&month=${m}`
      );
      const data = await res.json();
      setBlocked(data.blocked || []);
      setBooked(data.booked || []);
    } catch {
      toast.error("Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [apartmentId, month]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/vendor/apartments/blocked-dates?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove block");
      toast.success("Block removed");
      fetchCalendar();
    } catch (err) {
      toast.error(err.message || "Failed to remove block");
    } finally {
      setDeleting(null);
    }
  };

  const handleDayClick = (day, status) => {
    if (status.type === "blocked") {
      // clicking a blocked day offers to remove it
      if (confirm(`Remove block "${status.label}"?`)) {
        handleDelete(status.item.id);
      }
    } else if (status.type === "available") {
      setSelectedDay(day);
      setShowAddForm(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* iCal sync */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold text-gray-900">Availability Calendar</h2>
        <ICalPanel apartmentId={apartmentId} onImported={fetchCalendar} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-white border border-gray-200" />Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-100" />Booked by guest</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-100" />Blocked by you</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-purple-600" />
                {format(month, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-1">
                <button
                  onClick={() => setMonth((m) => subMonths(m, 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setMonth(new Date())}
                  className="h-8 px-2 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
                >
                  Today
                </button>
                <button
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              </div>
            ) : (
              <CalendarGrid
                month={month}
                blocked={blocked}
                booked={booked}
                onDayClick={handleDayClick}
              />
            )}
          </CardContent>
        </Card>

        {/* Sidebar: actions + block list */}
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col items-center gap-1">
                  <CalendarX className="h-5 w-5 text-red-400" />
                  <p className="text-xl font-bold text-gray-900">{blocked.length}</p>
                  <p className="text-xs text-gray-500">Blocked</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col items-center gap-1">
                  <CalendarCheck className="h-5 w-5 text-blue-400" />
                  <p className="text-xl font-bold text-gray-900">{booked.length}</p>
                  <p className="text-xs text-gray-500">Booked</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add block button */}
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" /> Block dates
            </Button>
          )}

          {/* Add block form */}
          {showAddForm && (
            <AddBlockForm
              apartmentId={apartmentId}
              onAdded={() => { setShowAddForm(false); fetchCalendar(); }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Existing blocks list */}
          <BlockList blocked={blocked} onDelete={handleDelete} deleting={deleting} />

          {/* Info tip */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p>Confirmed bookings cannot be blocked. Guests will see blocked dates as unavailable during booking.</p>
          </div>

          {/* Gap night warnings */}
          {gapNights.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100 text-xs text-red-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">
                  {gapNights.length} orphan night{gapNights.length !== 1 ? "s" : ""} detected
                </p>
                <p className="text-red-600 mb-1">
                  These single-night gaps between bookings/blocks are rarely booked and cause revenue loss.
                  Consider blocking them.
                </p>
                <ul className="space-y-0.5">
                  {gapNights.map((d) => (
                    <li key={d} className="font-medium">
                      {format(parseISO(d), "d MMM yyyy")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
