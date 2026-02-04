// components/shared/admin/customers/email-modal.jsx
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
  welcome: {
    subject: "Welcome to BookHushly!",
    body: `Dear [CUSTOMER_NAME],

Welcome to BookHushly! We're thrilled to have you as part of our community.

Start exploring amazing hotels, serviced apartments, and events across Nigeria.

Best regards,
BookHushly Team`,
  },
  booking_followup: {
    subject: "How was your recent booking?",
    body: `Dear [CUSTOMER_NAME],

We hope you enjoyed your recent booking with BookHushly!

We'd love to hear about your experience. Your feedback helps us serve you better.

Best regards,
BookHushly Team`,
  },
  special_offer: {
    subject: "Exclusive offer just for you!",
    body: `Dear [CUSTOMER_NAME],

As a valued BookHushly customer, we have an exclusive offer just for you!

Check out our latest deals and save on your next booking.

Best regards,
BookHushly Team`,
  },
  custom: {
    subject: "",
    body: "",
  },
};

export function EmailCustomerModal({ customer, onClose }) {
  const [template, setTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (value) => {
    setTemplate(value);
    const selectedTemplate = EMAIL_TEMPLATES[value];

    if (selectedTemplate) {
      const processedSubject = selectedTemplate.subject.replace(
        "[CUSTOMER_NAME]",
        customer.name || "Customer",
      );

      const processedBody = selectedTemplate.body.replace(
        /\[CUSTOMER_NAME\]/g,
        customer.name || "Customer",
      );

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
      const response = await fetch("/api/admin/customers/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          email: customer.email,
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
          <DialogTitle>Email Customer</DialogTitle>
          <p className="text-sm text-gray-600">Sending to: {customer.email}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Email Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template or write custom email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Welcome Email</SelectItem>
                <SelectItem value="booking_followup">
                  Booking Follow-up
                </SelectItem>
                <SelectItem value="special_offer">Special Offer</SelectItem>
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
