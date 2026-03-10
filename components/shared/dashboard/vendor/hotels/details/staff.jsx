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
  const [openMenuId, setOpenMenuId] = useState(null);

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
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === member.id ? null : member.id
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {openMenuId === member.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                            <button
                              className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleResetPassword(member);
                              }}
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
                            </button>
                            <button
                              className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => {
                                setOpenMenuId(null);
                                setDeletingStaff(member);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </button>
                          </div>
                        </>
                      )}
                    </div>
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

      {/* Add Receptionist Modal */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Add Receptionist
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Create a new receptionist account. A secure password will be
                auto-generated.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  A secure password will be automatically generated and
                  displayed after account creation. Make sure to save it
                  securely.
                </AlertDescription>
              </Alert>

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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {!!credentialsDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setCredentialsDialog(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Account Credentials
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Save these credentials securely. The password cannot be
                recovered.
              </p>
            </div>

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
                  The receptionist should change this password after first
                  login. This password will not be shown again.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setCredentialsDialog(null)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteDialogOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Remove Staff Member
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove this staff member? They will lose
              access to the receptionist portal immediately. This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
