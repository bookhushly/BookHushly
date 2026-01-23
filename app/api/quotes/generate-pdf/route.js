import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { quoteId, requestType } = await request.json();
    const supabase = await createClient();

    // Fetch quote and request details
    const { data: quote } = await supabase
      .from("service_quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Fetch request details
    const tableName =
      requestType === "logistics" ? "logistics_requests" : "security_requests";
    const { data: request } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", quote.request_id)
      .single();

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(109, 40, 217); // Purple
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("BookHushly", 15, 20);
    doc.setFontSize(12);
    doc.text("Service Quote", 15, 30);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Quote details
    let yPos = 55;
    doc.setFontSize(16);
    doc.text("Quote Details", 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Quote ID: ${quote.id.slice(0, 8)}...`, 15, yPos);
    yPos += 7;
    doc.text(
      `Date: ${new Date(quote.created_at).toLocaleDateString()}`,
      15,
      yPos,
    );
    yPos += 7;
    doc.text(
      `Valid Until: ${new Date(quote.valid_until).toLocaleDateString()}`,
      15,
      yPos,
    );

    // Customer details
    yPos += 15;
    doc.setFontSize(16);
    doc.text("Customer Information", 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Name: ${request.full_name}`, 15, yPos);
    yPos += 7;
    doc.text(`Phone: ${request.phone}`, 15, yPos);
    yPos += 7;
    doc.text(`Email: ${request.email}`, 15, yPos);

    // Service details
    yPos += 15;
    doc.setFontSize(16);
    doc.text("Service Details", 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    if (requestType === "logistics") {
      doc.text(`Service Type: ${request.service_type}`, 15, yPos);
      yPos += 7;
      doc.text(`From: ${request.pickup_state}`, 15, yPos);
      yPos += 7;
      doc.text(`To: ${request.delivery_state}`, 15, yPos);
      yPos += 7;
      doc.text(
        `Pickup Date: ${new Date(request.pickup_date).toLocaleDateString()}`,
        15,
        yPos,
      );
    } else {
      doc.text(`Service Type: ${request.service_type}`, 15, yPos);
      yPos += 7;
      doc.text(`Location: ${request.state}`, 15, yPos);
      yPos += 7;
      doc.text(
        `Start Date: ${new Date(request.start_date).toLocaleDateString()}`,
        15,
        yPos,
      );
      yPos += 7;
      doc.text(
        `Guards: ${request.number_of_guards} ${request.guard_type}`,
        15,
        yPos,
      );
    }

    // Cost breakdown
    yPos += 15;
    doc.setFontSize(16);
    doc.text("Cost Breakdown", 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Base Amount:`, 15, yPos);
    doc.text(
      `₦${parseFloat(quote.base_amount).toLocaleString()}`,
      pageWidth - 50,
      yPos,
    );

    yPos += 7;
    if (quote.breakdown) {
      Object.entries(quote.breakdown).forEach(([key, value]) => {
        doc.text(key, 15, yPos);
        doc.text(
          `₦${parseFloat(value).toLocaleString()}`,
          pageWidth - 50,
          yPos,
        );
        yPos += 7;
      });
    }

    // Total
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 8;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Total Amount:", 15, yPos);
    doc.text(
      `₦${parseFloat(quote.total_amount).toLocaleString()}`,
      pageWidth - 50,
      yPos,
    );

    // Footer
    yPos += 20;
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      "To proceed with this service, please make payment using the link sent to your email.",
      15,
      yPos,
    );
    yPos += 5;
    doc.text(
      "Payment must be completed before the quote expiry date.",
      15,
      yPos,
    );

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer");
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    // Upload to Supabase Storage
    const fileName = `quote_${quote.id}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("quotes")
      .upload(fileName, Buffer.from(pdfBuffer), {
        contentType: "application/pdf",
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("quotes").getPublicUrl(fileName);

    // Update quote with PDF URL
    await supabase
      .from("service_quotes")
      .update({ pdf_url: publicUrl })
      .eq("id", quoteId);

    // Update request with PDF URL
    await supabase
      .from(tableName)
      .update({ quote_pdf_url: publicUrl })
      .eq("id", quote.request_id);

    return NextResponse.json({
      success: true,
      pdfUrl: publicUrl,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
