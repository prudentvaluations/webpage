"use client";

import { useEffect, useState } from "react";

export default function RotatingWord({ items, interval = 2200 }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Respect users who prefer reduced motion: keep the first item static.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(id);
  }, [items.length, interval]);

  return (
    <span className="rotating-word" aria-live="polite">
      <span className={`rotating-word__text${visible ? " is-in" : " is-out"}`}>{items[index]}</span>
    </span>
  );
}
