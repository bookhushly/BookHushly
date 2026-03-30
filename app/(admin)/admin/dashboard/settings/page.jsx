"use client";

import { useAISettings } from "@/hooks/use-ai-settings";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  MessageCircle,
  PenLine,
  Star,
  MessagesSquare,
  BarChart2,
  Search,
  FileText,
  Cpu,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const FEATURE_META = {
  support_chat: {
    icon: MessageCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  listing_generator: {
    icon: PenLine,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  review_summarizer: {
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  quote_assistant: {
    icon: MessagesSquare,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  vendor_insights: {
    icon: BarChart2,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
  },
  natural_language_search: {
    icon: Search,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  },
  quote_drafting: {
    icon: FileText,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
};

function FeatureCard({ setting, onToggle, isToggling }) {
  const meta = FEATURE_META[setting.feature_key] ?? {
    icon: Cpu,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50",
    border: "border-gray-100",
  };
  const Icon = meta.icon;

  const lastUpdated = setting.updated_at
    ? formatDistanceToNow(new Date(setting.updated_at), { addSuffix: true })
    : null;

  return (
    <Card
      className={`border ${meta.border} transition-opacity ${!setting.enabled ? "opacity-60" : ""}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`shrink-0 h-10 w-10 rounded-xl ${meta.bg} ${meta.border} border flex items-center justify-center`}
          >
            <Icon className={`h-5 w-5 ${meta.color}`} strokeWidth={1.75} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {setting.feature_name}
              </p>
              <Badge
                variant="outline"
                className={
                  setting.enabled
                    ? "text-emerald-700 border-emerald-200 bg-emerald-50 text-[11px]"
                    : "text-gray-500 dark:text-gray-400 border-gray-200 bg-gray-50 text-[11px]"
                }
              >
                {setting.enabled ? "Active" : "Disabled"}
              </Badge>
            </div>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {setting.description}
            </p>
            {lastUpdated && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                Last updated {lastUpdated}
              </p>
            )}
          </div>

          {/* Toggle */}
          <div className="shrink-0 pt-0.5">
            <Switch
              checked={setting.enabled}
              onCheckedChange={(checked) =>
                onToggle(setting.feature_key, checked)
              }
              disabled={isToggling}
              aria-label={`Toggle ${setting.feature_name}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  const { settings, loading, error, toggle, isToggling } = useAISettings();

  const enabledCount = settings.filter((s) => s.enabled).length;

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="h-5 w-5 text-violet-600" strokeWidth={1.75} />
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white">AI Settings</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control which AI features are active on Bookhushly. Changes take
            effect immediately across the entire platform.
          </p>
        </div>

        {/* Summary strip */}
        {!loading && settings.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 border border-violet-100">
            <div className="h-2 w-2 rounded-full bg-violet-500" />
            <p className="text-sm text-violet-700">
              <span className="font-medium">{enabledCount}</span> of{" "}
              <span className="font-medium">{settings.length}</span> AI
              features are currently active
            </p>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner className="h-6 w-6 text-violet-600" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-3 px-4 py-4 rounded-xl bg-red-50 border border-red-100">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Failed to load AI settings</p>
              <p className="text-xs text-red-600 mt-0.5">
                The <code className="bg-red-100 px-1 rounded">ai_feature_settings</code> table may not exist yet.
                Run <code className="bg-red-100 px-1 rounded">supabase/migrations/ai_feature_settings.sql</code> in your Supabase SQL Editor, then refresh.
              </p>
            </div>
          </div>
        )}

        {/* Feature list */}
        {!loading && !error && settings.length > 0 && (
          <div className="space-y-3">
            {settings.map((setting) => (
              <FeatureCard
                key={setting.feature_key}
                setting={setting}
                onToggle={toggle}
                isToggling={isToggling}
              />
            ))}
          </div>
        )}

        {!loading && !error && settings.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <Cpu className="h-7 w-7 text-violet-400" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No AI settings found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Run <code className="bg-gray-100 px-1 rounded">supabase/migrations/ai_feature_settings.sql</code> in Supabase SQL Editor to create the table, then refresh this page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
