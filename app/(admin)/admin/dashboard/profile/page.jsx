"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  CheckCircle2,
  LogOut,
  Lock,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5 text-sm text-gray-800">
        <Icon className="h-3.5 w-3.5 text-violet-400 shrink-0" />
        <span>{value || "—"}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: row } = await supabase
        .from("users")
        .select("id, name, email, role, created_at")
        .eq("id", user.id)
        .single();

      const p = {
        id: user.id,
        name: row?.name || user.user_metadata?.name || "",
        email: user.email,
        phone: user.user_metadata?.phone || "",
        role: row?.role || "admin",
        created_at: row?.created_at,
      };
      setProfile(p);
      setForm({ name: p.name, phone: p.phone });
    })();
  }, []);

  const initials = profile?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AD";

  const handleSave = () => {
    startTransition(async () => {
      try {
        await supabase
          .from("users")
          .update({ name: form.name })
          .eq("id", profile.id);
        toast.success("Profile updated");
        setEditing(false);
        setProfile((p) => ({ ...p, name: form.name, phone: form.phone }));
      } catch {
        toast.error("Failed to save changes");
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email);
    if (error) toast.error("Failed to send reset email");
    else toast.success("Password reset email sent to " + profile.email);
  };

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Admin Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account information and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Left ── */}
        <Card>
          <div className="flex flex-col items-center text-center gap-3">
            <Avatar className="h-20 w-20 border-4 border-violet-100">
              <AvatarFallback className="bg-violet-700 text-white text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-base font-semibold text-gray-900">{profile.name || "—"}</h2>
              <p className="text-xs text-gray-400">{profile.email}</p>
            </div>

            <Badge className="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-50">
              <Shield className="h-3 w-3 mr-1" /> Administrator
            </Badge>

            {profile.created_at && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Admin since {format(new Date(profile.created_at), "MMMM yyyy")}
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 mt-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>

        {/* ── Right ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal info */}
          <Card
            title="Personal Information"
            action={
              !editing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="border-violet-200 text-violet-700 hover:bg-violet-50"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setForm({ name: profile.name, phone: profile.phone });
                    }}
                    className="border-gray-200 text-gray-600"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {isPending ? "Saving…" : "Save"}
                  </Button>
                </div>
              )
            }
          >
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="mt-1.5 rounded-xl"
                    placeholder="+234..."
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={User} label="Full Name" value={profile.name} />
                <InfoRow icon={Mail} label="Email Address" value={profile.email} />
                <InfoRow icon={Phone} label="Phone" value={profile.phone || "Not set"} />
                <InfoRow icon={Shield} label="Role" value="Administrator" />
              </div>
            )}
          </Card>

          {/* Permissions */}
          <Card title="Admin Permissions">
            <div className="space-y-2">
              {[
                { label: "Manage Vendors", desc: "Approve, suspend or remove vendor accounts" },
                { label: "Manage Customers", desc: "View and manage customer accounts" },
                { label: "Manage Bookings", desc: "View and override all bookings" },
                { label: "AI Settings", desc: "Enable or disable AI features platform-wide" },
                { label: "Quote Drafting", desc: "Generate AI-assisted quotes for service requests" },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="p-1.5 bg-violet-50 rounded-lg shrink-0">
                    <KeyRound className="h-3.5 w-3.5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.label}</p>
                    <p className="text-xs text-gray-400">{p.desc}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-400 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </Card>

          {/* Security */}
          <Card title="Account Security">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Verified</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 rounded-lg">
                    <Lock className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password</p>
                    <p className="text-xs text-gray-500">Keep your account secure</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-violet-200 text-violet-700 hover:bg-violet-50"
                  onClick={handlePasswordReset}
                >
                  Change
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
