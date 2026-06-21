import { Inter, Fraunces, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ScrollReveal from "@/components/ScrollReveal";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

// Classic high-contrast serif to match the Prudent Valuations letterhead wordmark.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prudent-valuations.vercel.app";
const title = "Prudent Valuations | Property, Gold, Vehicle & Asset Valuation Services";
const description =
  "Professional valuation services for property, gold, vehicles, movable assets, immovable assets, and general asset reporting.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Prudent Valuations",
  keywords: [
    "valuation services",
    "property valuation",
    "gold valuation",
    "vehicle valuation",
    "asset valuation Pakistan",
    "net worth certificate",
    "Lahore valuation firm",
  ],
  openGraph: {
    type: "website",
    title,
    description,
    siteName: "Prudent Valuations",
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630, alt: "Prudent Valuations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prudent Valuations",
    description:
      "Professional valuation services for property, gold, vehicles, and movable & immovable assets.",
    images: ["/assets/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/assets/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#5A2A82",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Prudent Valuations",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/assets/logo.png`,
        width: 1272,
        height: 434,
      },
      image: `${siteUrl}/assets/og-image.png`,
      email: "support@prudentvaluations.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "2nd Floor, Liberty, Main Boulevard, Gulberg",
        addressLocality: "Lahore",
        addressCountry: "PK",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Prudent Valuations",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#business`,
      name: "Prudent Valuations",
      image: `${siteUrl}/assets/og-image.png`,
      logo: `${siteUrl}/assets/logo.png`,
      description,
      url: siteUrl,
      email: "support@prudentvaluations.com",
      parentOrganization: { "@id": `${siteUrl}/#organization` },
      address: {
        "@type": "PostalAddress",
        streetAddress: "2nd Floor, Liberty, Main Boulevard, Gulberg",
        addressLocality: "Lahore",
        addressCountry: "PK",
      },
      areaServed: "PK",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "18:00",
      },
      serviceType: [
        "Property Valuation",
        "Gold Valuation",
        "Vehicle Valuation",
        "Movable Asset Valuation",
        "Immovable Asset Valuation",
        "General Asset Valuation Reports",
      ],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${playfair.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('reveal-ready');}}catch(e){}})();",
          }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
        <BackToTop />
        <ScrollReveal />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
