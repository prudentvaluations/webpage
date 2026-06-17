"use client";

import { useState } from "react";
import Image from "next/image";
import icon from "@/public/assets/logo-icon.png";

const LINKS = [
  { href: "#top", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <a className="brand" href="#top" aria-label="Prudent Valuations home">
          <Image
            src={icon}
            alt="Prudent Valuations logo"
            className="brand-icon"
            priority
            width={52}
            height={52}
          />
          <span className="brand-divider" aria-hidden="true"></span>
          <span className="brand-text">
            <span className="brand-name">
              <span className="brand-name-1">Prudent</span>{" "}
              <span className="brand-name-2">Valuations</span>
            </span>
            <span className="brand-rule" aria-hidden="true">
              <span className="brand-diamond"></span>
            </span>
            <span className="brand-tagline">by The Experts &ndash; A House of Prudent (Pvt.) Ltd.</span>
          </span>
        </a>

        <nav className="nav" aria-label="Primary">
          <button
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`nav-menu${open ? " open" : ""}`} id="nav-menu">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                className="nav-cta"
                href="mailto:prudentvaluations@gmail.com"
                onClick={() => setOpen(false)}
              >
                Contact Us
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
