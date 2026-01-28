import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request) {
  console.log("API /generate-pdf called"); // ENTRY LOG

  try {
    const { quoteId, requestType } = await request.json();
    console.log("Request body:", { quoteId, requestType });

    const supabase = await createClient();
    console.log("Supabase client created");

    // Fetch quote
    const { data: quote, error: quoteError } = await supabase
      .from("service_quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (quoteError) console.error("Error fetching quote:", quoteError);
    console.log("Fetched Quote:", quote);

    if (!quote) {
      console.warn("Quote not found for ID:", quoteId);
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Determine table
    const tableName =
      requestType === "logistics" ? "logistics_requests" : "security_requests";
    console.log("Request type:", requestType, "Using table:", tableName);

    // Fetch service request
    const { data: serviceRequest, error: reqError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", quote.request_id)
      .single();

    if (reqError) console.error("Error fetching service request:", reqError);
    console.log("Fetched Service Request:", serviceRequest);

    if (!serviceRequest) {
      console.warn("Service request not found for ID:", quote.request_id);
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 },
      );
    }

    // PDF generation
    console.log("Generating PDF...");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(109, 40, 217);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("BookHushly", 15, 20);
    doc.setFontSize(12);
    doc.text("Service Quote", 15, 30);
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

    // Customer info
    yPos += 15;
    doc.setFontSize(16);
    doc.text("Customer Information", 15, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Name: ${serviceRequest.full_name}`, 15, yPos);
    yPos += 7;
    doc.text(`Phone: ${serviceRequest.phone}`, 15, yPos);
    yPos += 7;
    doc.text(`Email: ${serviceRequest.email}`, 15, yPos);

    // Service details
    yPos += 15;
    doc.setFontSize(16);
    doc.text("Service Details", 15, yPos);
    yPos += 10;
    doc.setFontSize(10);

    if (requestType === "logistics") {
      doc.text(`Service Type: ${serviceRequest.service_type}`, 15, yPos);
      yPos += 7;
      doc.text(`From: ${serviceRequest.pickup_state}`, 15, yPos);
      yPos += 7;
      doc.text(`To: ${serviceRequest.delivery_state}`, 15, yPos);
      yPos += 7;
      doc.text(
        `Pickup Date: ${new Date(serviceRequest.pickup_date).toLocaleDateString()}`,
        15,
        yPos,
      );
    } else {
      doc.text(`Service Type: ${serviceRequest.service_type}`, 15, yPos);
      yPos += 7;
      doc.text(`Location: ${serviceRequest.state}`, 15, yPos);
      yPos += 7;
      doc.text(
        `Start Date: ${new Date(serviceRequest.start_date).toLocaleDateString()}`,
        15,
        yPos,
      );
      yPos += 7;
      doc.text(
        `Guards: ${serviceRequest.number_of_guards} ${serviceRequest.guard_type}`,
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
      console.log("Quote breakdown:", quote.breakdown);
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

    // Generate PDF
    console.log("Generating PDF buffer...");
    const pdfBuffer = doc.output("arraybuffer");
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
    console.log("PDF buffer generated, size:", pdfBuffer.byteLength);

    // Upload PDF
    const fileName = `quote_${quote.id}_${Date.now()}.pdf`;
    console.log("Uploading PDF to Supabase storage:", fileName);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("quotes")
      .upload(fileName, Buffer.from(pdfBuffer), {
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    console.log("PDF uploaded successfully:", uploadData);

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("quotes")
      .getPublicUrl(fileName);
    console.log("Public URL generated:", publicData?.publicUrl);

    // Update quote & request with PDF URL
    await supabase
      .from("service_quotes")
      .update({ pdf_url: publicData.publicUrl })
      .eq("id", quoteId);
    await supabase
      .from(tableName)
      .update({ quote_pdf_url: publicData.publicUrl })
      .eq("id", quote.request_id);

    console.log("Database updated with PDF URL");

    return NextResponse.json({
      success: true,
      pdfUrl: publicData.publicUrl,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
