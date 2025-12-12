import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Download, Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import jsPDF from "jspdf";

export function QRCodeGenerator({ vendorId, businessName }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const profileUrl = `${window.location.origin}/vendor-profile/${vendorId}`;

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      const dataUrl = await QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#7c3aed", // Purple color to match theme
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const downloadPDF = () => {
    if (!qrCodeDataUrl) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add logo area (placeholder for now - you'll need to add your actual logo)
    pdf.setFontSize(24);
    pdf.setTextColor(124, 58, 237); // Purple color
    pdf.text("Bookhushly", pageWidth / 2, 30, { align: "center" });

    // Add title
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Vendor Profile QR Code", pageWidth / 2, 50, { align: "center" });

    // Add business name
    pdf.setFontSize(16);
    pdf.text(businessName || "Vendor Profile", pageWidth / 2, 65, {
      align: "center",
    });

    // Add QR code
    const qrSize = 80;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 80;
    pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // Add URL below QR code
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(profileUrl, pageWidth / 2, qrY + qrSize + 20, {
      align: "center",
    });

    // Add instructions
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      "Scan this QR code to view our services and make bookings",
      pageWidth / 2,
      qrY + qrSize + 35,
      { align: "center" }
    );

    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      "Generated on " + new Date().toLocaleDateString(),
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );

    pdf.save(`${businessName || "vendor"}-profile-qr.pdf`);
    toast.success("QR code PDF downloaded successfully");
  };

  useEffect(() => {
    if (qrCodeDataUrl === "") {
      generateQRCode();
    }
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <QrCode className="mr-2 h-4 w-4" />
          Generate Profile QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Profile QR Code</DialogTitle>
          <DialogDescription>
            Share your profile with customers by letting them scan this QR code
            or share the direct link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Display */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              {isGenerating ? (
                <div className="flex items-center justify-center h-32 w-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Profile QR Code"
                  className="w-32 h-32"
                />
              ) : (
                <div className="h-32 w-32 bg-gray-200 rounded flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Link */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Profile Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={profileUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={generateQRCode}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Regenerate QR Code
          </Button>
          <Button
            onClick={downloadPDF}
            disabled={!qrCodeDataUrl}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
