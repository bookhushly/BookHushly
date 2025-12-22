"use client";

import { useMemo } from "react";

/**
 * Safely renders HTML content from the rich text editor
 * Sanitizes content to prevent XSS attacks while preserving formatting
 */
export default function RichContentRenderer({ content, className = "" }) {
  // Sanitize HTML content
  const sanitizedContent = useMemo(() => {
    if (!content) return "";

    // Basic sanitization - removes script tags and dangerous attributes
    const cleaned = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/g, "")
      .replace(/on\w+='[^']*'/g, "")
      .replace(/javascript:/gi, "");

    return cleaned;
  }, [content]);

  if (!sanitizedContent) {
    return null;
  }

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
