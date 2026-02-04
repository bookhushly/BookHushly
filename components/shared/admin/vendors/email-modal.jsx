// components/admin/vendors/EmailVendorModal.jsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Loader2 } from "lucide-react";

const EMAIL_TEMPLATES = {
  approval: {
    subject: "Your vendor account has been approved",
    body: `Dear [VENDOR_NAME],

We're pleased to inform you that your vendor account for [BUSINESS_NAME] has been approved!

You can now start managing your listings and accepting bookings through BookHushly.

Best regards,
BookHushly Team`,
  },
  rejection: {
    subject: "Update on your vendor application",
    body: `Dear [VENDOR_NAME],

Thank you for your interest in becoming a vendor on BookHushly. After reviewing your application, we're unable to approve it at this time.

If you have any questions, please don't hesitate to reach out to us.

Best regards,
BookHushly Team`,
  },
  verification_needed: {
    subject: "Additional verification required",
    body: `Dear [VENDOR_NAME],

We need some additional information to complete the verification of your vendor account for [BUSINESS_NAME].

Please log in to your account and complete the required verification steps.

Best regards,
BookHushly Team`,
  },
  payment_issue: {
    subject: "Payment settlement notice",
    body: `Dear [VENDOR_NAME],

We're reaching out regarding a payment settlement for [BUSINESS_NAME].

Please review your banking information and ensure all details are up to date.

Best regards,
BookHushly Team`,
  },
  custom: {
    subject: "",
    body: "",
  },
};

export function EmailVendorModal({ vendor, onClose }) {
  const [template, setTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (value) => {
    setTemplate(value);
    const selectedTemplate = EMAIL_TEMPLATES[value];

    if (selectedTemplate) {
      const processedSubject = selectedTemplate.subject
        .replace("[VENDOR_NAME]", vendor.users?.name || "Vendor")
        .replace("[BUSINESS_NAME]", vendor.business_name);

      const processedBody = selectedTemplate.body
        .replace(/\[VENDOR_NAME\]/g, vendor.users?.name || "Vendor")
        .replace(/\[BUSINESS_NAME\]/g, vendor.business_name);

      setSubject(processedSubject);
      setBody(processedBody);
    }
  };

  const handleSend = async () => {
    if (!subject || !body) {
      alert("Please fill in both subject and body");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/admin/vendors/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          email: vendor.users?.email,
          subject,
          body,
        }),
      });

      if (!response.ok) throw new Error("Failed to send email");

      alert("Email sent successfully!");
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email Vendor</DialogTitle>
          <p className="text-sm text-gray-600">
            Sending to: {vendor.users?.email}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Email Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template or write custom email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approval">Approval Notification</SelectItem>
                <SelectItem value="rejection">Rejection Notice</SelectItem>
                <SelectItem value="verification_needed">
                  Verification Required
                </SelectItem>
                <SelectItem value="payment_issue">Payment Issue</SelectItem>
                <SelectItem value="custom">Custom Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body"
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
