"use client";

import { useEffect } from "react";

// Curated set of repeated content blocks to fade-up on scroll.
const SELECTOR =
  ".section .section-head, .card, .step, .price-card, .faq-item, .trust-card, .prose, .use-cases";

export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    // Only animate when the pre-hide class is active (skipped under reduced motion).
    if (!root.classList.contains("reveal-ready")) return;

    const els = Array.from(document.querySelectorAll(SELECTOR));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    // Only animate elements that start below the fold — anything already in
    // view stays visible (no flash, better for LCP).
    const fold = window.innerHeight * 0.9;
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < fold) return;
      el.classList.add("reveal");
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
