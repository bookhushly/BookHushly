import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import sharp from "sharp";
import { fromBuffer } from "pdf2pic";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("menu");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF or image files (JPEG/PNG) allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit to stay under Hugging Face free-tier constraints)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit. Please upload a smaller file." },
        { status: 400 }
      );
    }

    // Read file into buffer
    let buffer = Buffer.from(await file.arrayBuffer());

    // Convert PDF to image if necessary
    if (file.type === "application/pdf") {
      try {
        const output = await fromBuffer(buffer, {
          density: 100,
          format: "png",
          width: 800,
          height: 1200,
        }).bulk(-1, { responseType: "buffer" });
        buffer = output[0].buffer; // Use first page
        console.log(
          "PDF converted to image, new size:",
          buffer.length,
          "bytes"
        );
      } catch (pdfError) {
        console.error("PDF conversion failed:", pdfError.message);
        throw new Error("Failed to convert PDF to image");
      }
    }

    // Resize images to reduce payload size
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      try {
        buffer = await sharp(buffer)
          .resize({ width: 800, withoutEnlargement: true }) // Resize to max 800px width
          .jpeg({ quality: 80 }) // Compress JPEG quality
          .toBuffer();
        console.log("Image resized, new size:", buffer.length, "bytes");
      } catch (sharpError) {
        console.warn("Image resizing failed:", sharpError.message);
        // Proceed with original buffer if resizing fails
      }
    }

    // Save file temporarily
    const filePath = path.join(tmpdir(), `menu-${Date.now()}-${file.name}`);
    await writeFile(filePath, buffer);

    // Convert to base64 for Hugging Face API
    const base64Image = buffer.toString("base64");
    const mimeType = file.type === "application/pdf" ? "image/png" : file.type;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    console.log("File size after base64 encoding:", dataUrl.length, "bytes");

    // Call Hugging Face API
    const endpoint =
      "https://api-inference.huggingface.co/models/facebook/nougat-base";
    console.log("Calling Hugging Face API at:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: dataUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", response.status, errorText);
      if (response.status === 404) {
        return NextResponse.json(
          {
            error:
              "Hugging Face model not found. Please try again later or contact support.",
          },
          { status: 404 }
        );
      }
      if (response.status === 413) {
        return NextResponse.json(
          {
            error:
              "File too large for Hugging Face API. Please upload a file under 5MB.",
          },
          { status: 413 }
        );
      }
      throw new Error(
        `Hugging Face API failed: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Hugging Face API response:", data); // Log for debugging

    // Parse Nougat output (expects array of { generated_text: string } in Markdown format)
    let extractedItems = [];
    if (Array.isArray(data) && data[0]?.generated_text) {
      // Split Markdown text into lines
      const lines = data[0].generated_text
        .split("\n")
        .filter((line) => line.trim());
      extractedItems = lines
        .map((line) => {
          // Match patterns like "Dish Name - $10.99", "Dish Name: ₦2500", or "Dish Name 2500"
          const match = line.match(
            /^(.+?)\s*[-:]\s*[\$₦]?([\d.]+)|(.+?)\s+([\d.]+)/
          );
          if (match) {
            return {
              name: (match[1] || match[3]).trim(),
              price: (match[2] || match[4]).trim(),
              description: "",
            };
          }
          return null;
        })
        .filter((item) => item);
    } else {
      console.warn("Unexpected Nougat output structure:", data);
      throw new Error("No valid menu items found in document");
    }

    // Map to meals format and limit to 20
    const meals = extractedItems
      .map((item) => ({
        name: item.name || "Unknown Dish",
        price: item.price.toString().replace(/[^0-9.]/g, ""), // Clean price
        description: item.description || "",
      }))
      .filter(
        (meal) => meal.name && meal.price && !isNaN(parseFloat(meal.price))
      )
      .slice(0, 20); // Respect your 20-meal limit

    if (meals.length === 0) {
      throw new Error("No valid menu items extracted from the document");
    }

    return NextResponse.json({ meals });
  } catch (error) {
    console.error("Error in extract-prices:", error.message, error.stack);
    return NextResponse.json(
      { error: `Failed to extract prices: ${error.message}` },
      { status: 500 }
    );
  }
}
