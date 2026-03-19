"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  UserPlus,
  KeyRound,
  Trash2,
  Copy,
  Check,
  Pencil,
  Loader2,
  ShieldCheck,
  Mail,
  User,
  AlertTriangle,
  HeadphonesIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ── API helpers ────────────────────────────────────────────────────────────────
const api = {
  list: () => fetch("/api/admin/support-staff").then((r) => r.json()),
  create: (email, name) =>
    fetch("/api/admin/support-staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    }).then((r) => r.json()),
  resetPassword: (userId) =>
    fetch("/api/admin/support-staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "reset_password" }),
    }).then((r) => r.json()),
  updateName: (userId, name) =>
    fetch("/api/admin/support-staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "update_name", name }),
    }).then((r) => r.json()),
  delete: (userId) =>
    fetch("/api/admin/support-staff", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then((r) => r.json()),
};

// ── Password reveal box (shared by create + reset flows) ─────────────────────
function PasswordBox({ label, password, onClose }) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 font-medium">{label}</p>
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 block bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-gray-900 overflow-x-auto">
          {visible ? password : "•".repeat(password.length)}
        </code>
        <button
          onClick={() => setVisible((v) => !v)}
          className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
          title={visible ? "Hide" : "Reveal"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button
          onClick={copy}
          className="p-2 text-gray-400 hover:text-violet-600 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="text-xs text-amber-700">
        Share this password securely. It will not be shown again after you close this dialog.
      </p>

      {onClose && (
        <Button size="sm" className="w-full mt-1" onClick={onClose}>
          Done — I've saved the password
        </Button>
      )}
    </div>
  );
}

// ── Create Staff Dialog ────────────────────────────────────────────────────────
function CreateStaffDialog({ open, onOpenChange }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [createdCreds, setCreatedCreds] = useState(null);

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.create(email, name),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
        return;
      }
      qc.invalidateQueries({ queryKey: ["support-staff"] });
      setCreatedCreds({ email: data.email, password: data.password });
      toast.success(`Account created for ${data.name}`);
    },
    onError: () => toast.error("Failed to create account"),
  });

  const handleClose = () => {
    setName("");
    setEmail("");
    setCreatedCreds(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-violet-600" />
            Add Support Staff
          </DialogTitle>
          <DialogDescription>
            Create a login for someone to manage the support inbox. They'll use
            the email and the generated password to sign in.
          </DialogDescription>
        </DialogHeader>

        {!createdCreds ? (
          <>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="staff-name">
                  <User className="h-3.5 w-3.5 inline mr-1" />
                  Full Name
                </Label>
                <Input
                  id="staff-name"
                  placeholder="e.g. Amara Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">
                  <Mail className="h-3.5 w-3.5 inline mr-1" />
                  Email Address
                </Label>
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="e.g. support@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-start gap-2 bg-violet-50 rounded-lg p-3">
                <ShieldCheck className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                <p className="text-xs text-violet-800">
                  A secure 16-character password will be auto-generated. You'll
                  see it once — save it before closing.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                onClick={() => mutate()}
                disabled={isPending || !name.trim() || !email.trim()}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
              <Check className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">
                Account created for <strong>{createdCreds.email}</strong>
              </p>
            </div>

            <PasswordBox
              label="Generated Password — share this with the staff member"
              password={createdCreds.password}
              onClose={handleClose}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Reset Password Dialog ──────────────────────────────────────────────────────
function ResetPasswordDialog({ staff, open, onOpenChange }) {
  const [newPassword, setNewPassword] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.resetPassword(staff.id),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setNewPassword(data.password);
      toast.success("Password reset successfully");
    },
    onError: () => toast.error("Failed to reset password"),
  });

  const handleClose = () => {
    setNewPassword(null);
    setConfirmed(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-amber-600" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            Generate a new password for <strong>{staff?.name}</strong> (
            {staff?.email}).
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {!newPassword ? (
            <>
              {!confirmed ? (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    This will immediately invalidate their current password. They
                    will need the new password to log in.
                  </p>
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reset-confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="reset-confirm" className="cursor-pointer text-sm">
                  I understand — reset the password now
                </Label>
              </div>
            </>
          ) : (
            <PasswordBox
              label={`New password for ${staff?.name} — share this securely`}
              password={newPassword}
              onClose={handleClose}
            />
          )}
        </div>

        {!newPassword && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={() => mutate()}
              disabled={isPending || !confirmed}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting…
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Name Dialog ───────────────────────────────────────────────────────────
function EditNameDialog({ staff, open, onOpenChange }) {
  const qc = useQueryClient();
  const [name, setName] = useState(staff?.name || "");

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.updateName(staff.id, name),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
        return;
      }
      qc.invalidateQueries({ queryKey: ["support-staff"] });
      toast.success("Name updated");
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update name"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-violet-600" />
            Edit Name
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-3">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutate()}
            disabled={isPending || !name.trim() || name.trim() === staff?.name}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Staff Table Row ────────────────────────────────────────────────────────────
function StaffRow({ member, onReset, onEdit, onDelete }) {
  const lastLogin = member.last_sign_in_at
    ? format(new Date(member.last_sign_in_at), "dd MMM yyyy, HH:mm")
    : "Never";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50/60 transition-colors">
      {/* Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
          <HeadphonesIcon className="h-4 w-4 text-violet-600" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{member.name}</p>
          <p className="text-xs text-gray-500 truncate">{member.email}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Last login: {lastLogin}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant="outline"
          className="text-violet-700 border-violet-200 bg-violet-50 text-[11px] hidden sm:flex"
        >
          Support
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-500 hover:text-violet-700"
          onClick={() => onEdit(member)}
          title="Edit name"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-500 hover:text-amber-700"
          onClick={() => onReset(member)}
          title="Reset password"
        >
          <KeyRound className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-gray-500 hover:text-red-600"
          onClick={() => onDelete(member)}
          title="Remove staff member"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Panel ─────────────────────────────────────────────────────────────────
export default function SupportStaffPanel() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["support-staff"],
    queryFn: api.list,
    select: (d) => d.staff || [],
  });

  const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => api.delete(deleteTarget.id),
    onSuccess: (res) => {
      if (res.error) {
        toast.error(res.error);
        return;
      }
      qc.invalidateQueries({ queryKey: ["support-staff"] });
      toast.success(`${deleteTarget.name} removed`);
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to remove staff member"),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Support Staff</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage logins for staff who handle the customer support inbox.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 shrink-0"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Info card */}
      <Card className="border-violet-100 bg-violet-50/40">
        <CardContent className="p-4 flex items-start gap-3">
          <HeadphonesIcon className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-violet-900">How support staff access works</p>
            <p className="text-violet-700 text-xs leading-relaxed">
              Staff with the <strong>support</strong> role can log in and access
              the support inbox at <code className="bg-violet-100 px-1 rounded">/support</code>.
              They can view conversations, reply to customers, and mark chats as resolved.
              They cannot access vendor, customer, or admin management pages.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Staff list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Active Staff
            {data && (
              <Badge variant="secondary" className="ml-2 font-normal">
                {data.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Click the key icon to reset a password, the pencil to edit a name,
            or the bin to remove access entirely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-600 py-6 justify-center text-sm">
              <AlertTriangle className="h-4 w-4" />
              Failed to load staff. Please refresh.
            </div>
          ) : data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <HeadphonesIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-700">No support staff yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Add your first staff member to get started.
              </p>
              <Button
                size="sm"
                className="mt-4 bg-violet-600 hover:bg-violet-700"
                onClick={() => setCreateOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((member) => (
                <StaffRow
                  key={member.id}
                  member={member}
                  onReset={setResetTarget}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateStaffDialog open={createOpen} onOpenChange={setCreateOpen} />

      {resetTarget && (
        <ResetPasswordDialog
          staff={resetTarget}
          open={!!resetTarget}
          onOpenChange={(o) => !o && setResetTarget(null)}
        />
      )}

      {editTarget && (
        <EditNameDialog
          staff={editTarget}
          open={!!editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Remove Staff Member?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.name}</strong>'s account (
              {deleteTarget?.email}). They will immediately lose access to the
              support inbox and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => doDelete()}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes, Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
