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
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/g, "")
      .replace(/on\w+='[^']*'/g, "")
      .replace(/javascript:/gi, "");
  }, [content]);

  if (!sanitizedContent) {
    return null;
  }

  return (
    <div
      className={`prose prose-sm max-w-none overflow-hidden [&_*]:max-w-full [&_img]:max-w-full [&_table]:w-full [&_table]:table-fixed [&_pre]:whitespace-pre-wrap [&_pre]:overflow-x-auto [&_*]:break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
