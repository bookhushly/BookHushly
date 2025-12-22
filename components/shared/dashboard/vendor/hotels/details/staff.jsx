"use client";

import { useState, useEffect } from "react";
import {
  getHotelStaff,
  createReceptionist,
  resetReceptionistPassword,
  deleteReceptionist,
} from "@/lib/hotelstaff";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Mail,
  UserCheck,
  Trash2,
  Copy,
  CheckCircle2,
  MoreVertical,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";

export function HotelStaffTab({ hotelId, hotelName }) {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [credentialsDialog, setCredentialsDialog] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [resettingPassword, setResettingPassword] = useState(null);
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });

  useEffect(() => {
    loadStaff();
  }, [hotelId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await getHotelStaff(hotelId);
      setStaff(data);
    } catch (error) {
      console.error("Error loading staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.name.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSending(true);

    try {
      const result = await createReceptionist(
        hotelId,
        formData.email,
        formData.name
      );

      setCredentialsDialog(result);
      setDialogOpen(false);
      setFormData({ email: "", name: "" });
      loadStaff();

      toast.success("Receptionist account created successfully");
    } catch (error) {
      console.error("Error creating receptionist:", error);
      toast.error(error.message || "Failed to create receptionist account");
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async (member) => {
    setResettingPassword(member.user_id);

    try {
      const result = await resetReceptionistPassword(member.user_id);
      setCredentialsDialog({
        email: member.users.email,
        password: result.password,
      });
      toast.success("Password reset successfully");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    } finally {
      setResettingPassword(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingStaff) return;

    try {
      await deleteReceptionist(deletingStaff.id, deletingStaff.user_id);
      toast.success("Staff member removed successfully");
      setDeleteDialogOpen(false);
      setDeletingStaff(null);
      loadStaff();
    } catch (error) {
      console.error("Error deleting staff member:", error);
      toast.error("Failed to remove staff member");
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Staff Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage receptionist accounts for {hotelName}
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Receptionist
          </Button>
        </div>

        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Receptionists can log in to manage guest check-ins/check-outs and
            room statuses. Each receptionist receives a secure auto-generated
            password.
          </AlertDescription>
        </Alert>

        {staff.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No staff members yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add receptionists to help manage your hotel operations
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Receptionist
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member) => (
              <Card
                key={member.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {member.users?.name || "Unknown"}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.users?.email}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleResetPassword(member)}
                          disabled={resettingPassword === member.user_id}
                        >
                          {resettingPassword === member.user_id ? (
                            <>
                              <LoadingSpinner className="h-4 w-4 mr-2" />
                              Resetting...
                            </>
                          ) : (
                            <>
                              <RotateCw className="h-4 w-4 mr-2" />
                              Reset Password
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeletingStaff(member);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {member.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      Added {new Date(member.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Receptionist Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Receptionist</DialogTitle>
            <DialogDescription>
              Create a new receptionist account. A secure password will be
              auto-generated.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="e.g., receptionist@hotel.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                A secure password will be automatically generated and displayed
                after account creation. Make sure to save it securely.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {sending ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog
        open={!!credentialsDialog}
        onOpenChange={() => setCredentialsDialog(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Account Credentials</DialogTitle>
            <DialogDescription>
              Save these credentials securely. The password cannot be recovered.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex gap-2">
                <Input value={credentialsDialog?.email || ""} readOnly />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(credentialsDialog?.email, "Email")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input
                  value={credentialsDialog?.password || ""}
                  readOnly
                  type="text"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    copyToClipboard(credentialsDialog?.password, "Password")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-900">
                The receptionist should change this password after first login.
                This password will not be shown again.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setCredentialsDialog(null)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this staff member? They will lose
              access to the receptionist portal immediately. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
