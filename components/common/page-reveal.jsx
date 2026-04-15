"use client";

import { useEffect } from "react";

/**
 * PageReveal — singleton IntersectionObserver for the landing page.
 *
 * Watches every element with class "reveal" or "reveal-stagger".
 * When an element enters the viewport it gets class "in-view" added —
 * CSS transitions in globals.css handle the actual animation.
 * Each element is unobserved immediately after triggering (fire once).
 *
 * Renders nothing — purely a side-effect component.
 * Place once in the page that needs scroll reveals.
 */
export default function PageReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll(".reveal, .reveal-stagger");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      {
        // Start animating when 8% of the element is visible.
        // rootMargin pushes the trigger line 48px up from the bottom
        // of the viewport so elements begin animating just before they
        // reach the natural scroll stop — feels anticipatory, not laggy.
        threshold: 0.08,
        rootMargin: "0px 0px -48px 0px",
      }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
